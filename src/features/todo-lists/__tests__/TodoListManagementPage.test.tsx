import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TodoListManagementPage } from "../TodoListManagementPage";

jest.mock("@/features/routine/pages/NavigationContext", () => ({
  useNavigationContext: jest.fn(() => jest.fn()),
}));

jest.mock("../selectedTodoList", () => ({
  setSelectedTodoListId: jest.fn(),
}));

jest.mock("@/components", () => ({
  // CardPanel だけを差し替え、他は本物を使う。個別に列挙すると、
  // 新しい共通コンポーネントを使い始めたときに undefined になって落ちる
  ...jest.requireActual("@/components"),
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
  saveTodoListsToLocal: jest.fn(),
}));

import { getTodoLists } from "../storage";
import { saveTodoListsToLocal } from "../sync";
import { setSelectedTodoListId } from "../selectedTodoList";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";

const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockSaveTodoListsToLocal = saveTodoListsToLocal as jest.MockedFunction<
  typeof saveTodoListsToLocal
>;
const mockSetSelectedTodoListId = setSelectedTodoListId as jest.MockedFunction<
  typeof setSelectedTodoListId
>;
const mockUseNavigationContext = useNavigationContext as jest.MockedFunction<
  typeof useNavigationContext
>;

describe("TodoListManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodoLists.mockReturnValue([]);
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    (window.confirm as jest.Mock).mockRestore();
  });

  it("リストがない場合は空状態を表示する", () => {
    render(<TodoListManagementPage />);
    expect(screen.getByText("Todoリストはまだありません")).toBeInTheDocument();
  });

  it("新しいリストを追加できる", async () => {
    render(<TodoListManagementPage />);

    fireEvent.click(screen.getByText("＋ 新しいリストを追加"));
    fireEvent.change(screen.getByPlaceholderText("リストのタイトル"), {
      target: { value: "買い物" },
    });
    fireEvent.click(screen.getByText("作成"));

    await waitFor(() => {
      expect(screen.getByText("✅ 買い物")).toBeInTheDocument();
    });
    expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
      expect.objectContaining({ title: "買い物" }),
    ]);
  });

  it("表示切替で非表示状態にできる", async () => {
    mockGetTodoLists.mockReturnValue([
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);

    render(<TodoListManagementPage />);
    fireEvent.click(screen.getByLabelText("Inbox の表示切替"));

    await waitFor(() => {
      expect(screen.getByText("非表示")).toBeInTheDocument();
    });
    expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([
      expect.objectContaining({ id: "list-1", isHidden: true }),
    ]);
  });

  it("カテゴリ管理リンクをクリックするとカテゴリ管理ページに遷移する", () => {
    const mockNavigate = jest.fn();
    mockUseNavigationContext.mockReturnValue(mockNavigate);

    render(<TodoListManagementPage />);
    fireEvent.click(screen.getByText("🏷️ カテゴリ管理"));

    expect(mockNavigate).toHaveBeenCalledWith("todo-category-management");
  });

  it("リストタイトルをクリックするとそのリストに遷移する", () => {
    const mockNavigate = jest.fn();
    mockUseNavigationContext.mockReturnValue(mockNavigate);
    mockGetTodoLists.mockReturnValue([
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);

    render(<TodoListManagementPage />);
    fireEvent.click(screen.getByLabelText("Inbox を開く"));

    expect(mockSetSelectedTodoListId).toHaveBeenCalledWith("list-1");
    expect(mockNavigate).toHaveBeenCalledWith("todo-lists");
  });

  it("確認後にリストを削除できる", async () => {
    mockGetTodoLists.mockReturnValue([
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);

    render(<TodoListManagementPage />);
    fireEvent.click(screen.getByLabelText("Inbox を削除"));

    await waitFor(() => {
      expect(
        screen.getByText("Todoリストはまだありません"),
      ).toBeInTheDocument();
    });
    expect(mockSaveTodoListsToLocal).toHaveBeenCalledWith([]);
  });
});
