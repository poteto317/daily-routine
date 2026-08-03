import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { TodoListsPage } from "../TodoListsPage";

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// ---------- dnd-kit モック ----------
// DndContext: onDragStart/onDragEnd/onDragCancel をキャプチャして外部から呼び出せるようにする
type DragCallbacks = {
  onDragStart?: (e: { active: { id: string } }) => void;
  onDragEnd?: (e: {
    active: { id: string };
    over: { id: string } | null;
  }) => void;
  onDragCancel?: () => void;
};
let capturedDragCallbacks: DragCallbacks = {};
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragStart,
    onDragEnd,
    onDragCancel,
  }: React.PropsWithChildren<DragCallbacks>) => {
    capturedDragCallbacks = { onDragStart, onDragEnd, onDragCancel };
    return <>{children}</>;
  },
  DragOverlay: ({ children }: React.PropsWithChildren) => <>{children}</>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  TouchSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));
jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
  sortableKeyboardCoordinates: jest.fn(),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => undefined) } },
}));
// ------------------------------------

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
  getTodoCategories: jest.fn(() => []),
}));

jest.mock("../sync", () => ({
  saveTodoListsToLocal: jest.fn(),
}));

jest.mock("../selectedTodoList", () => ({
  getSelectedTodoListId: jest.fn(),
  setSelectedTodoListId: jest.fn(),
  subscribeSelectedTodoListId: jest.fn(() => () => undefined),
}));

import { getTodoLists } from "../storage";
import { saveTodoListsToLocal } from "../sync";
import {
  getSelectedTodoListId,
  setSelectedTodoListId,
} from "../selectedTodoList";

const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockSaveTodoListsToLocal = saveTodoListsToLocal as jest.MockedFunction<
  typeof saveTodoListsToLocal
>;
const mockGetSelectedTodoListId = getSelectedTodoListId as jest.MockedFunction<
  typeof getSelectedTodoListId
>;

const getItemTitleButton = (title: string) =>
  screen.getByRole("button", {
    name: (accessibleName) => accessibleName.startsWith(`「${title}」`),
  });

const LONG_PRESS_DELAY_MS = 550;

/** タイトルボタンを長押しして選択状態をトグルする（TodoItemTitleButtonのuseLongPress既定値500msに対応）。 */
const selectItem = async (title: string) => {
  const btn = getItemTitleButton(title);
  fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, LONG_PRESS_DELAY_MS));
  });
  fireEvent.pointerUp(btn);
};
const mockSetSelectedTodoListId = setSelectedTodoListId as jest.MockedFunction<
  typeof setSelectedTodoListId
>;

const baseList = {
  id: "list-1",
  title: "Inbox",
  items: [
    {
      id: "item-1",
      title: "Task 1",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
    {
      id: "item-2",
      title: "Done Task",
      isCompleted: true,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("TodoListsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodoLists.mockReturnValue([]);
    mockGetSelectedTodoListId.mockReturnValue(null);
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    (window.confirm as jest.Mock).mockRestore();
    jest.useRealTimers();
  });

  it("表示可能なリストがない場合は空状態を表示する", () => {
    render(<TodoListsPage />);
    expect(
      screen.getByText("Todoリストが選択されていません"),
    ).toBeInTheDocument();
  });

  it("選択中のリストを表示する", () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("1/2 完了")).toBeInTheDocument();
  });

  it("選択IDが不正なら先頭の表示可能リストへフォールバックする", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("missing");

    render(<TodoListsPage />);

    await waitFor(() => {
      expect(mockSetSelectedTodoListId).toHaveBeenCalledWith("list-1");
    });
  });

  it("Todoを追加できる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
      target: { value: "New Task" },
    });
    fireEvent.click(screen.getByText("追加"));

    await waitFor(() => {
      expect(screen.getByText("New Task")).toBeInTheDocument();
    });
    expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "list-1",
        items: expect.arrayContaining([
          expect.objectContaining({ title: "New Task" }),
        ]),
      }),
    ]);
  });

  it("EnterキーでもTodoを追加でき、空入力では追加しない", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const input = screen.getByPlaceholderText("Todoを追加...");
    fireEvent.change(input, { target: { value: " Enter Task " } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Enter Task")).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(
      mockSaveTodoListsToLocal.mock.calls.filter(([lists]) =>
        lists[0].items.some((item) => item.title === "Enter Task"),
      ),
    ).toHaveLength(1);
  });

  it("完了済みの表示を切り替えられる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);
    fireEvent.click(screen.getByText("完了済みを表示"));

    await waitFor(() => {
      expect(screen.queryByText("Done Task")).toBeNull();
    });
    expect(screen.getByText("完了済みを非表示")).toBeInTheDocument();
  });

  it("hideCompleted中に表示対象の子がない親には折りたたみボタンを表示しない", async () => {
    const listWithCompletedChild = {
      ...baseList,
      items: [
        {
          id: "parent",
          title: "Parent Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child-done",
          title: "Child Done",
          isCompleted: true,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithCompletedChild]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(screen.getByLabelText("子Todoを折りたたむ")).toBeInTheDocument();

    fireEvent.click(screen.getByText("完了済みを表示"));

    await waitFor(() => {
      expect(screen.queryByText("Child Done")).not.toBeInTheDocument();
    });
    expect(
      screen.queryByLabelText("子Todoを折りたたむ"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("子Todoを展開")).not.toBeInTheDocument();
  });

  it("hideCompleted中も未完了の子が残る親には折りたたみボタンを維持する", async () => {
    const listWithMixedChildren = {
      ...baseList,
      items: [
        {
          id: "parent",
          title: "Parent Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child-done",
          title: "Child Done",
          isCompleted: true,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
        {
          id: "child-open",
          title: "Child Open",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithMixedChildren]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getByText("完了済みを表示"));

    await waitFor(() => {
      expect(screen.queryByText("Child Done")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Child Open")).toBeInTheDocument();
    expect(screen.getByLabelText("子Todoを折りたたむ")).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByLabelText("子Todoを折りたたむ"));

    await waitFor(() => {
      expect(screen.queryByText("Child Open")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("子Todoを展開")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("確認後にTodoを削除できる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);
    fireEvent.click(screen.getAllByLabelText("削除")[0]);

    await waitFor(() => {
      expect(screen.queryByText("Task 1")).toBeNull();
    });
    expect(mockSaveTodoListsToLocal).toHaveBeenCalled();
  });

  it("完了切替とインデント操作ができる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getByLabelText("「Task 1」を完了にする"));
    fireEvent.click(screen.getAllByLabelText("インデントを上げる")[1]);
    fireEvent.click(screen.getAllByLabelText("インデントを下げる")[1]);

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalled();
    });
  });

  it("デフォルトでは末尾に追加ボタンが表示される", () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(screen.getByRole("button", { name: "末尾に追加" })).toBeInTheDocument();
  });

  it("末尾に追加ボタンをクリックすると先頭に追加に切り替わりlocalStorageに保存される", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getByRole("button", { name: "末尾に追加" }));

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          addItemPosition: "first",
        }),
      ]);
    });
    expect(screen.getByRole("button", { name: "先頭に追加" })).toBeInTheDocument();
  });

  it("先頭に追加が設定されているとき末尾に追加ボタンをクリックすると末尾に戻りlocalStorageに保存される", async () => {
    mockGetTodoLists.mockReturnValue([
      { ...baseList, addItemPosition: "first" as const },
    ]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(screen.getByRole("button", { name: "先頭に追加" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "先頭に追加" }));

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          addItemPosition: "last",
        }),
      ]);
    });
    expect(screen.getByRole("button", { name: "末尾に追加" })).toBeInTheDocument();
  });

  it("先頭に追加が設定されているときTodoを追加すると先頭に追加される", async () => {
    mockGetTodoLists.mockReturnValue([
      { ...baseList, addItemPosition: "first" as const },
    ]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
      target: { value: "First Item" },
    });
    fireEvent.click(screen.getByText("追加"));

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          items: expect.arrayContaining([
            expect.objectContaining({ title: "First Item" }),
          ]),
        }),
      ]);
    });

    const savedItems = mockSaveTodoListsToLocal.mock.calls.at(-1)![0][0].items;
    expect(savedItems[0].title).toBe("First Item");
  });

  it("タイトルをクリックしてTodoを完了/未完了にできる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "「Task 1」を完了にする" }),
    );

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          items: expect.arrayContaining([
            expect.objectContaining({ id: "item-1", isCompleted: true }),
          ]),
        }),
      ]);
    });

    fireEvent.click(
      screen.getByRole("button", { name: "「Task 1」を未完了に戻す" }),
    );

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenLastCalledWith([
        expect.objectContaining({
          id: "list-1",
          items: expect.arrayContaining([
            expect.objectContaining({ id: "item-1", isCompleted: false }),
          ]),
        }),
      ]);
    });
  });

  it("タイトルボタンの aria-pressed が完了状態を反映する", () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    // 未完了アイテム: aria-pressed="false"
    expect(
      screen.getByRole("button", { name: "「Task 1」を完了にする" }),
    ).toHaveAttribute("aria-pressed", "false");
    // 完了済みアイテム: aria-pressed="true"
    expect(
      screen.getByRole("button", { name: "「Done Task」を未完了に戻す" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("ドラッグ中はタイトルボタンが disabled になる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    // ドラッグ前は disabled なし
    expect(
      screen.getByRole("button", { name: "「Task 1」を完了にする" }),
    ).not.toBeDisabled();

    act(() => {
      capturedDragCallbacks.onDragStart!({ active: { id: "item-1" } });
    });

    await waitFor(() => {
      // ドラッグ中は disabled
      const buttons = screen.getAllByRole("button", {
        name: "「Task 1」を完了にする",
      });
      expect(buttons[0]).toBeDisabled();
    });
  });

  it("スワイプではインデントできない（表示順が常に固定ソートされ生配列と乖離しうるため常時無効）", () => {
    jest.useFakeTimers();
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const swipeContainer = screen.getByText("Done Task").closest(".relative");
    expect(swipeContainer).not.toBeNull();

    fireEvent.touchStart(swipeContainer as HTMLElement, {
      touches: [{ clientX: 300, clientY: 100 }],
    });
    fireEvent.touchMove(swipeContainer as HTMLElement, {
      touches: [{ clientX: 150, clientY: 100 }],
    });
    fireEvent.touchEnd(swipeContainer as HTMLElement);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // インデント保存を含め、スワイプ操作によるいかなる永続化も発生しないことを検証する
    // （not.toHaveBeenCalledWithだけではスワイプ配線自体が壊れた場合も通ってしまうため、
    // 呼び出しゼロを直接検証する）
    expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
  });

  it("表示順は常に未完了→完了済みの固定ソートになる（生配列で完了が先頭でも表示は末尾）", () => {
    mockGetTodoLists.mockReturnValue([
      {
        ...baseList,
        items: [
          {
            id: "item-2",
            title: "Done Task",
            isCompleted: true,
            createdAt: "2026-03-07T00:00:00.000Z",
          },
          {
            id: "item-1",
            title: "Task 1",
            isCompleted: false,
            createdAt: "2026-03-07T00:00:00.000Z",
          },
        ],
      },
    ]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const renderedItems = screen.getAllByRole("listitem");
    const titles = renderedItems.map((li) => li.textContent ?? "");
    const task1Index = titles.findIndex((t) => t.includes("Task 1"));
    const doneIndex = titles.findIndex((t) => t.includes("Done Task"));
    expect(task1Index).toBeGreaterThanOrEqual(0);
    expect(doneIndex).toBeGreaterThanOrEqual(0);
    expect(task1Index).toBeLessThan(doneIndex);
  });

  it("ドラッグハンドル（並び替えボタン）が表示される（同一セクション内のDnDは常時試行可能なため）", () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(
      screen.getAllByRole("button", { name: "並び替え" }).length,
    ).toBeGreaterThan(0);
  });

  it("詳細リストが消えた場合は空状態へフォールバックする", () => {
    mockGetTodoLists.mockReturnValueOnce([baseList]).mockReturnValueOnce([]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(
      screen.getByText("Todoリストが選択されていません"),
    ).toBeInTheDocument();
  });

  it("空リストと完了済みのみ表示を扱う", async () => {
    const emptyList = {
      ...baseList,
      items: [],
    };
    const completedOnlyList = {
      ...baseList,
      items: [
        {
          id: "item-3",
          title: "Done Only",
          isCompleted: true,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ],
    };

    mockGetSelectedTodoListId.mockReturnValue("list-1");

    mockGetTodoLists.mockReturnValue([emptyList]);

    const view = render(<TodoListsPage />);

    expect(screen.getByText("まだTodoがありません")).toBeInTheDocument();
    expect(
      screen.getByText("下のフォームからTodoを追加しましょう"),
    ).toBeInTheDocument();

    mockGetTodoLists.mockReturnValue([completedOnlyList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    view.unmount();
    render(<TodoListsPage />);
    fireEvent.click(screen.getByText("完了済みを表示"));

    await waitFor(() => {
      expect(screen.getByText("完了済みのみです")).toBeInTheDocument();
    });
  });

  it("子を持つ親Todoには折りたたみボタンが表示される", () => {
    const listWithParent = {
      ...baseList,
      items: [
        {
          id: "parent",
          title: "Parent Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child",
          title: "Child Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithParent]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    // 親には折りたたみボタン（▼）が表示される
    expect(screen.getByLabelText("子Todoを折りたたむ")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    // 子（葉）にはボタンなし（スペーサーを使用）
    expect(screen.queryByLabelText("子Todoを展開")).not.toBeInTheDocument();
  });

  it("子を持たないTodoには折りたたみボタンが表示されない", () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(
      screen.queryByLabelText("子Todoを折りたたむ"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("子Todoを展開")).not.toBeInTheDocument();
  });

  it("折りたたみボタンを押すと子Todoが非表示になる", async () => {
    const listWithParent = {
      ...baseList,
      items: [
        {
          id: "parent",
          title: "Parent Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child",
          title: "Child Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithParent]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    expect(screen.getByText("Child Task")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("子Todoを折りたたむ"));

    await waitFor(() => {
      expect(screen.queryByText("Child Task")).not.toBeInTheDocument();
    });
    // 折りたたみ後はボタンが ▶（展開）に変わる
    expect(screen.getByLabelText("子Todoを展開")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("展開ボタンを押すと子Todoが再び表示される", async () => {
    const listWithParent = {
      ...baseList,
      items: [
        {
          id: "parent",
          title: "Parent Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child",
          title: "Child Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithParent]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getByLabelText("子Todoを折りたたむ"));
    await waitFor(() => {
      expect(screen.queryByText("Child Task")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("子Todoを展開"));
    await waitFor(() => {
      expect(screen.getByText("Child Task")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("子Todoを折りたたむ")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("折りたたみは指定した親のみに適用され、他の親には影響しない", async () => {
    const listWithTwoParents = {
      ...baseList,
      items: [
        {
          id: "parent-a",
          title: "Parent A",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child-a",
          title: "Child A",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
        {
          id: "parent-b",
          title: "Parent B",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "child-b",
          title: "Child B",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithTwoParents]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const collapseButtons = screen.getAllByLabelText("子Todoを折りたたむ");
    expect(collapseButtons).toHaveLength(2);

    // Parent A だけ折りたたむ
    fireEvent.click(collapseButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Child A")).not.toBeInTheDocument();
    });
    // Parent B の子は影響を受けない
    expect(screen.getByText("Child B")).toBeInTheDocument();
  });

  it("インデントに応じた marginLeft が適用される（getItemIndentLevel に委譲）", () => {
    const listWithIndent = {
      ...baseList,
      items: [
        {
          id: "root",
          title: "Root Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 0,
        },
        {
          id: "nested",
          title: "Nested Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 2,
        },
      ],
    };

    mockGetTodoLists.mockReturnValue([listWithIndent]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const rootLi = screen.getByText("Root Task").closest("li");
    const nestedLi = screen.getByText("Nested Task").closest("li");

    expect(rootLi).toHaveStyle("margin-left: 0px");
    expect(nestedLi).toHaveStyle("margin-left: 40px");
  });

  it("アイテムを選択すると選択バーが表示される", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    await selectItem("Task 1");

    await waitFor(() => {
      expect(screen.getByText("1件選択中")).toBeInTheDocument();
    });
    expect(screen.getByText(/切り取り/)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "「Task 1」を完了にする（選択中）" }),
    ).toBeInTheDocument();
  });

  it("選択解除ボタンで選択バーが消える", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    await selectItem("Task 1");
    await waitFor(() => {
      expect(screen.getByText("1件選択中")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("選択解除"));

    await waitFor(() => {
      expect(screen.queryByText("1件選択中")).toBeNull();
    });
  });

  it("切り取りするとアイテムがリストから消えクリップボードバーが表示される", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    await selectItem("Task 1");
    await waitFor(() => {
      expect(screen.getByText(/切り取り/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/切り取り/));

    await waitFor(() => {
      expect(screen.queryByText("Task 1")).toBeNull();
    });
    expect(screen.getByText(/1件のTodoをペーストできます/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ペースト/ }),
    ).toBeInTheDocument();
  });

  it("クリップボードキャンセルボタンでクリップボードバーが消える", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    await selectItem("Task 1");
    await waitFor(() =>
      expect(screen.getByText(/切り取り/)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText(/切り取り/));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /ペースト/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    await waitFor(() => {
      expect(screen.queryByText(/ペースト/)).toBeNull();
    });
  });

  it("ペーストするとアイテムが同一リストの末尾に追加される", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    await selectItem("Task 1");
    await waitFor(() =>
      expect(screen.getByText(/切り取り/)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText(/切り取り/));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /ペースト/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /ペースト/ }));

    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });
    expect(screen.queryByText(/ペースト/)).toBeNull();
  });

  it("アイテムの🎨ボタンをクリックすると色選択ポップオーバーが表示・非表示を切り替えられる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const bgButtons = screen.getAllByLabelText("背景色を変更");
    expect(bgButtons[0]).toHaveAttribute("aria-expanded", "false");

    // クリックでピッカーが開く
    fireEvent.click(bgButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "赤" })).toBeInTheDocument();
    });
    expect(bgButtons[0]).toHaveAttribute("aria-expanded", "true");

    // もう一度クリックでピッカーが閉じる
    fireEvent.click(bgButtons[0]);

    await waitFor(() => {
      expect(screen.queryByRole("radio", { name: "赤" })).toBeNull();
    });
    expect(bgButtons[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("カラーピッカーで色を選択するとbgColorが保存されピッカーが閉じる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getAllByLabelText("背景色を変更")[0]);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "赤" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("radio", { name: "赤" }));

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          items: expect.arrayContaining([
            expect.objectContaining({ id: "item-1", bgColor: "bg-red-50" }),
          ]),
        }),
      ]);
    });

    // 選択後にピッカーが閉じる
    await waitFor(() => {
      expect(screen.queryByRole("radio", { name: "赤" })).toBeNull();
    });
  });

  it("一括背景色ボタンをクリックすると一括カラーピッカーが表示される", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    const bulkBtn = screen.getByLabelText("一括背景色変更");
    expect(bulkBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(bulkBtn);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "赤" })).toBeInTheDocument();
    });
    expect(bulkBtn).toHaveAttribute("aria-expanded", "true");
  });

  it("一括カラーピッカーで色を選択するとすべてのアイテムのbgColorが更新されピッカーが閉じる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getByLabelText("一括背景色変更"));

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "青" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("radio", { name: "青" }));

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          items: expect.arrayContaining([
            expect.objectContaining({ id: "item-1", bgColor: "bg-blue-50" }),
            expect.objectContaining({ id: "item-2", bgColor: "bg-blue-50" }),
          ]),
        }),
      ]);
    });

    // 選択後にピッカーが閉じる
    expect(screen.getByLabelText("一括背景色変更")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("リスト切替後もクリップボードが保持されペーストできる（リスト間移動）", async () => {
    const list2 = {
      id: "list-2",
      title: "Work",
      items: [
        {
          id: "item-3",
          title: "Work Task",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };

    mockGetTodoLists.mockReturnValue([baseList, list2]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    const { rerender } = render(<TodoListsPage />);

    // list-1 の Task 1 を選択して切り取り
    await selectItem("Task 1");
    await waitFor(() =>
      expect(screen.getByText(/切り取り/)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText(/切り取り/));

    await waitFor(() => {
      expect(
        screen.getByText(/1件のTodoをペーストできます/),
      ).toBeInTheDocument();
    });

    // list-2 に切り替える
    mockGetSelectedTodoListId.mockReturnValue("list-2");
    rerender(<TodoListsPage />);

    await waitFor(() => {
      expect(screen.getByText("Work Task")).toBeInTheDocument();
    });

    // クリップボードバーがまだ表示されている
    expect(screen.getByText(/1件のTodoをペーストできます/)).toBeInTheDocument();

    // list-2 にペースト
    fireEvent.click(screen.getByRole("button", { name: /ペースト/ }));

    await waitFor(() => {
      expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "list-2",
            items: expect.arrayContaining([
              expect.objectContaining({ title: "Task 1" }),
            ]),
          }),
        ]),
      );
    });
    expect(screen.queryByText(/ペースト/)).toBeNull();
  });

  // ============================================================
  // dnd-kit ドラッグ＆ドロップ
  // ============================================================
  describe("dnd-kit ドラッグ＆ドロップ", () => {
    const dndList = {
      id: "list-1",
      title: "DnD List",
      items: [
        {
          id: "item-a",
          title: "Alpha",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "item-b",
          title: "Beta",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "item-c",
          title: "Gamma",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };

    beforeEach(() => {
      capturedDragCallbacks = {};
      mockGetTodoLists.mockReturnValue([dndList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");
    });

    it("onDragEnd で異なるアイテム間なら onReorderItemsAction が呼ばれ永続化される", async () => {
      render(<TodoListsPage />);

      // DndContext が capture されていること
      expect(capturedDragCallbacks.onDragEnd).toBeDefined();

      // item-a (index 0) → item-c (index 2) へドロップ
      act(() => {
        capturedDragCallbacks.onDragEnd!({
          active: { id: "item-a" },
          over: { id: "item-c" },
        });
      });

      await waitFor(() => {
        expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
          expect.objectContaining({
            id: "list-1",
            items: [
              expect.objectContaining({ id: "item-b" }),
              expect.objectContaining({ id: "item-c" }),
              expect.objectContaining({ id: "item-a" }),
            ],
          }),
        ]);
      });
    });

    it("onDragEnd で active と over が同一 id なら onReorderItemsAction は呼ばれない", async () => {
      render(<TodoListsPage />);

      act(() => {
        capturedDragCallbacks.onDragEnd!({
          active: { id: "item-b" },
          over: { id: "item-b" },
        });
      });

      // 同一アイテムへのドロップでは saveTodoListsToLocal が呼ばれない
      await waitFor(() => {
        expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
      });
    });

    it("onDragEnd で over が null なら onReorderItemsAction は呼ばれない", async () => {
      render(<TodoListsPage />);

      act(() => {
        capturedDragCallbacks.onDragEnd!({
          active: { id: "item-a" },
          over: null,
        });
      });

      await waitFor(() => {
        expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
      });
    });

    it("onDragEnd で完了状態が異なるアイテム間（セクションを跨ぐ）へのドロップでは永続化されない（意図しない再親子付けの防止）", async () => {
      mockGetTodoLists.mockReturnValue([
        {
          ...dndList,
          items: [
            ...dndList.items,
            {
              id: "item-done",
              title: "Delta",
              isCompleted: true,
              createdAt: "2026-03-07T00:00:00.000Z",
            },
          ],
        },
      ]);

      render(<TodoListsPage />);

      act(() => {
        capturedDragCallbacks.onDragEnd!({
          active: { id: "item-a" },
          over: { id: "item-done" },
        });
      });

      await waitFor(() => {
        expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
      });
    });

    it("onDragStart で DragOverlay 用の activeItem が表示される", async () => {
      render(<TodoListsPage />);

      act(() => {
        capturedDragCallbacks.onDragStart!({ active: { id: "item-b" } });
      });

      await waitFor(() => {
        // DragOverlay 内にアイテムタイトルが表示される
        expect(screen.getAllByText("Beta")).toHaveLength(2);
      });
    });

    it("ドラッグ中はタイトルクリックでトグルされない", async () => {
      render(<TodoListsPage />);

      act(() => {
        capturedDragCallbacks.onDragStart!({ active: { id: "item-a" } });
      });

      await waitFor(() => {
        expect(screen.getAllByText("Alpha")).toHaveLength(2);
      });

      fireEvent.click(
        screen.getAllByRole("button", { name: "「Alpha」を完了にする" })[0],
      );

      expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
    });

    it("onDragCancel でドラッグ状態がリセットされる", async () => {
      render(<TodoListsPage />);

      act(() => {
        capturedDragCallbacks.onDragStart!({ active: { id: "item-b" } });
      });
      await waitFor(() => {
        expect(screen.getAllByText("Beta")).toHaveLength(2);
      });

      act(() => {
        capturedDragCallbacks.onDragCancel!();
      });

      await waitFor(() => {
        // DragOverlay が消えリスト内の1件のみになる
        expect(screen.getAllByText("Beta")).toHaveLength(1);
      });
    });
  });

  // ============================================================
  // Undo / Redo
  // ============================================================
  describe("Undo / Redo", () => {
    it("初期状態では「元に戻す」「やり直す」ボタンが disabled", () => {
      mockGetTodoLists.mockReturnValue([baseList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");

      render(<TodoListsPage />);

      expect(screen.getByRole("button", { name: "元に戻す" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "やり直す" })).toBeDisabled();
    });

    it("Todo追加後に「元に戻す」ボタンが有効になる", async () => {
      mockGetTodoLists.mockReturnValue([baseList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");

      render(<TodoListsPage />);

      fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
        target: { value: "Undo Target" },
      });
      fireEvent.click(screen.getByText("追加"));

      await waitFor(() => {
        expect(screen.getByText("Undo Target")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: "元に戻す" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "やり直す" })).toBeDisabled();
    });

    it("「元に戻す」ボタンクリックで追加操作が取り消される", async () => {
      mockGetTodoLists.mockReturnValue([baseList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");

      render(<TodoListsPage />);

      fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
        target: { value: "Undo Target" },
      });
      fireEvent.click(screen.getByText("追加"));

      await waitFor(() => {
        expect(screen.getByText("Undo Target")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "元に戻す" }));

      await waitFor(() => {
        expect(screen.queryByText("Undo Target")).toBeNull();
      });
      expect(screen.getByRole("button", { name: "元に戻す" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "やり直す" })).not.toBeDisabled();
    });

    it("「やり直す」ボタンクリックで取り消した操作を再実行できる", async () => {
      mockGetTodoLists.mockReturnValue([baseList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");

      render(<TodoListsPage />);

      fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
        target: { value: "Redo Target" },
      });
      fireEvent.click(screen.getByText("追加"));

      await waitFor(() => expect(screen.getByText("Redo Target")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "元に戻す" }));
      await waitFor(() => expect(screen.queryByText("Redo Target")).toBeNull());

      fireEvent.click(screen.getByRole("button", { name: "やり直す" }));

      await waitFor(() => expect(screen.getByText("Redo Target")).toBeInTheDocument());
      expect(screen.getByRole("button", { name: "元に戻す" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "やり直す" })).toBeDisabled();
    });

    it("Cmd+Z キーボードショートカットで元に戻せる", async () => {
      mockGetTodoLists.mockReturnValue([baseList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");

      render(<TodoListsPage />);

      fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
        target: { value: "Keyboard Undo" },
      });
      fireEvent.click(screen.getByText("追加"));

      await waitFor(() =>
        expect(screen.getByText("Keyboard Undo")).toBeInTheDocument(),
      );

      fireEvent.keyDown(window, { key: "z", metaKey: true });

      await waitFor(() =>
        expect(screen.queryByText("Keyboard Undo")).toBeNull(),
      );
    });

    it("Cmd+Shift+Z キーボードショートカットでやり直せる", async () => {
      mockGetTodoLists.mockReturnValue([baseList]);
      mockGetSelectedTodoListId.mockReturnValue("list-1");

      render(<TodoListsPage />);

      fireEvent.change(screen.getByPlaceholderText("Todoを追加..."), {
        target: { value: "Keyboard Redo" },
      });
      fireEvent.click(screen.getByText("追加"));

      await waitFor(() =>
        expect(screen.getByText("Keyboard Redo")).toBeInTheDocument(),
      );

      fireEvent.keyDown(window, { key: "z", metaKey: true });
      await waitFor(() => expect(screen.queryByText("Keyboard Redo")).toBeNull());

      fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });

      await waitFor(() =>
        expect(screen.getByText("Keyboard Redo")).toBeInTheDocument(),
      );
    });
  });
});
