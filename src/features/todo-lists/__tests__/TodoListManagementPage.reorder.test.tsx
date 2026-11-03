import type { DragEndEvent } from "@dnd-kit/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { TodoList } from "../types";
import { TodoListManagementPage } from "../TodoListManagementPage";

// DndContext を差し替えて onDragEnd を受け取る（TodoListsPage.test.tsx と同じ方針）。
let mockOnDragEnd: ((event: DragEndEvent) => void) | undefined;

jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  DndContext: ({
    children,
    onDragEnd,
  }: React.PropsWithChildren<{
    onDragEnd?: (event: DragEndEvent) => void;
  }>) => {
    mockOnDragEnd = onDragEnd;
    return <>{children}</>;
  },
}));

// SortableContext だけを差し替える。arrayMove は todoListManagementReorder.ts が
// 使うので、requireActual で本物のまま残す（無いと行の順のテストが TypeError で落ちる）。
jest.mock("@dnd-kit/sortable", () => ({
  ...jest.requireActual("@dnd-kit/sortable"),
  SortableContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock("@/features/routine/pages/NavigationContext", () => ({
  useNavigationContext: jest.fn(() => jest.fn()),
}));

jest.mock("../selectedTodoList", () => ({
  setSelectedTodoListId: jest.fn(),
}));

jest.mock("@/components", () => ({
  ...jest.requireActual("@/components"),
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveTodoListsToLocal: jest.fn(),
}));

jest.mock("@/features/settings", () => ({
  ...jest.requireActual("@/features/settings"),
  getSettings: jest.fn(),
  saveMenuOrder: jest.fn(),
}));

import {
  DEFAULT_SETTINGS,
  getSettings,
  saveMenuOrder,
} from "@/features/settings";
import {
  STATICS_AFTER_LISTS,
  STATICS_BEFORE_LISTS,
} from "@/hooks/__fixtures__/menuOrderNaturalIds";
import { getTodoLists } from "../storage";
import { saveTodoListsToLocal } from "../sync";

const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockSaveTodoListsToLocal = saveTodoListsToLocal as jest.MockedFunction<
  typeof saveTodoListsToLocal
>;
const mockGetSettings = getSettings as jest.MockedFunction<typeof getSettings>;
const mockSaveMenuOrder = saveMenuOrder as jest.MockedFunction<
  typeof saveMenuOrder
>;

const createList = (
  id: string,
  title: string,
  overrides: Partial<TodoList> = {},
): TodoList => ({
  id,
  title,
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const dragEnd = (activeId: string, overId: string | null) =>
  ({
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  }) as unknown as DragEndEvent;

const rowLabels = () =>
  screen
    .getAllByRole("button", { name: /を開く$/ })
    .map((button) => button.getAttribute("aria-label"));

describe("TodoListManagementPage の並び替え", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDragEnd = undefined;
    mockGetTodoLists.mockReturnValue([
      createList("list-a", "買い物"),
      createList("list-h", "旅行", { isHidden: true }),
      createList("list-c", "仕事"),
    ]);
    mockGetSettings.mockReturnValue({ ...DEFAULT_SETTINGS, menuOrder: [] });
  });

  it("末尾のリストを先頭のリストへドラッグすると、行の順が変わり、menuOrder だけを保存する（非表示のリストも残る）", () => {
    render(<TodoListManagementPage />);
    expect(rowLabels()).toEqual([
      "買い物 を開く",
      "旅行 を開く",
      "仕事 を開く",
    ]);
    expect(screen.getAllByRole("button", { name: "並び替え" })).toHaveLength(3);
    expect(mockOnDragEnd).toBeDefined();

    act(() => {
      mockOnDragEnd?.(dragEnd("list-c", "list-a"));
    });

    expect(rowLabels()).toEqual([
      "仕事 を開く",
      "買い物 を開く",
      "旅行 を開く",
    ]);
    expect(mockSaveMenuOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveMenuOrder).toHaveBeenCalledWith([
      ...STATICS_BEFORE_LISTS,
      "todo-list-list-c",
      "todo-list-list-a",
      "todo-list-list-h",
      ...STATICS_AFTER_LISTS,
    ]);
    expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
  });

  it("並べ替えた後にリストを作ると、新しいリストは末尾に出て、保存する配列は作成順のまま", () => {
    render(<TodoListManagementPage />);
    act(() => {
      mockOnDragEnd?.(dragEnd("list-c", "list-a"));
    });

    fireEvent.click(screen.getByText("＋ 新しいリストを追加"));
    fireEvent.change(screen.getByPlaceholderText("リストのタイトル"), {
      target: { value: "新規" },
    });
    fireEvent.click(screen.getByText("作成"));

    expect(rowLabels()).toEqual([
      "仕事 を開く",
      "買い物 を開く",
      "旅行 を開く",
      "新規 を開く",
    ]);
    expect(
      mockSaveTodoListsToLocal.mock.calls[0][0].map((list) => list.title),
    ).toEqual(["買い物", "旅行", "仕事", "新規"]);
  });

  it("over が無いドラッグ（一覧の外で離した）では何も保存しない", () => {
    render(<TodoListManagementPage />);
    expect(mockOnDragEnd).toBeDefined();

    act(() => {
      mockOnDragEnd?.(dragEnd("list-c", null));
    });

    expect(rowLabels()).toEqual([
      "買い物 を開く",
      "旅行 を開く",
      "仕事 を開く",
    ]);
    expect(mockSaveMenuOrder).not.toHaveBeenCalled();
  });
});
