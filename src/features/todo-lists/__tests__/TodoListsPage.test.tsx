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

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveAndSyncTodoLists: jest.fn(),
}));

jest.mock("../selectedTodoList", () => ({
  getSelectedTodoListId: jest.fn(),
  setSelectedTodoListId: jest.fn(),
  subscribeSelectedTodoListId: jest.fn(() => () => undefined),
}));

import { getTodoLists } from "../storage";
import { saveAndSyncTodoLists } from "../sync";
import {
  getSelectedTodoListId,
  setSelectedTodoListId,
} from "../selectedTodoList";

const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockSaveAndSyncTodoLists = saveAndSyncTodoLists as jest.MockedFunction<
  typeof saveAndSyncTodoLists
>;
const mockGetSelectedTodoListId = getSelectedTodoListId as jest.MockedFunction<
  typeof getSelectedTodoListId
>;
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
    expect(mockSaveAndSyncTodoLists).toHaveBeenCalledWith([
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
      mockSaveAndSyncTodoLists.mock.calls.filter(([lists]) =>
        lists[0].items.some((item) => item.title === "Enter Task"),
      ),
    ).toHaveLength(1);
  });

  it("完了済みの表示を切り替えられる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);
    fireEvent.click(screen.getByText("完了済みを非表示"));

    await waitFor(() => {
      expect(screen.queryByText("Done Task")).toBeNull();
    });
    expect(screen.getByText("完了済みを表示")).toBeInTheDocument();
  });

  it("確認後にTodoを削除できる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);
    fireEvent.click(screen.getAllByLabelText("削除")[0]);

    await waitFor(() => {
      expect(screen.queryByText("Task 1")).toBeNull();
    });
    expect(mockSaveAndSyncTodoLists).toHaveBeenCalled();
  });

  it("完了切替とインデント操作ができる", async () => {
    mockGetTodoLists.mockReturnValue([baseList]);
    mockGetSelectedTodoListId.mockReturnValue("list-1");

    render(<TodoListsPage />);

    fireEvent.click(screen.getByLabelText("完了にする"));
    fireEvent.click(screen.getAllByLabelText("インデントを上げる")[1]);
    fireEvent.click(screen.getAllByLabelText("インデントを下げる")[1]);

    await waitFor(() => {
      expect(mockSaveAndSyncTodoLists).toHaveBeenCalled();
    });
  });

  it("スワイプでもインデントできる", async () => {
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

    await waitFor(() => {
      expect(mockSaveAndSyncTodoLists).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "list-1",
          items: expect.arrayContaining([
            expect.objectContaining({ id: "item-2", indent: 1 }),
          ]),
        }),
      ]);
    });
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
    fireEvent.click(screen.getByText("完了済みを非表示"));

    await waitFor(() => {
      expect(screen.getByText("完了済みのみです")).toBeInTheDocument();
    });
  });
});
