import { fireEvent, render, screen } from "@testing-library/react";
import { TodoListManagementItem } from "../TodoListManagementItem";
import type { TodoList } from "../types";

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const defaultProps = {
  list: createList(),
  editingListId: null,
  editingListTitleValue: "",
  onChangeTitleValue: jest.fn(),
  onCommitEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onOpenList: jest.fn(),
  onToggleVisibility: jest.fn(),
  onStartEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("TodoListManagementItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("リストタイトルを表示する", () => {
    render(<TodoListManagementItem {...defaultProps} />);
    expect(screen.getByText("✅ Inbox")).toBeInTheDocument();
  });

  it("タイトルをクリックすると onOpenList が呼ばれる", () => {
    const onOpenList = jest.fn();
    render(<TodoListManagementItem {...defaultProps} onOpenList={onOpenList} />);
    fireEvent.click(screen.getByLabelText("Inbox を開く"));
    expect(onOpenList).toHaveBeenCalledWith("list-1");
  });

  it("表示切替ボタンをクリックすると onToggleVisibility が呼ばれる", () => {
    const onToggleVisibility = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        onToggleVisibility={onToggleVisibility}
      />,
    );
    fireEvent.click(screen.getByLabelText("Inbox の表示切替"));
    expect(onToggleVisibility).toHaveBeenCalledWith(defaultProps.list);
  });

  it("編集ボタンをクリックすると onStartEdit が呼ばれる", () => {
    const onStartEdit = jest.fn();
    render(<TodoListManagementItem {...defaultProps} onStartEdit={onStartEdit} />);
    fireEvent.click(screen.getByLabelText("Inbox を編集"));
    expect(onStartEdit).toHaveBeenCalledWith("list-1", "Inbox");
  });

  it("削除ボタンをクリックすると onDelete が呼ばれる", () => {
    const onDelete = jest.fn();
    render(<TodoListManagementItem {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Inbox を削除"));
    expect(onDelete).toHaveBeenCalledWith(defaultProps.list);
  });

  it("編集中はインライン入力フィールドを表示する", () => {
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="変更後タイトル"
      />,
    );
    const input = screen.getByDisplayValue("変更後タイトル");
    expect(input).toBeInTheDocument();
    expect(screen.queryByText("✅ Inbox")).not.toBeInTheDocument();
  });

  it("編集中に Enter キーで onCommitEdit が呼ばれる", () => {
    const onCommitEdit = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
        onCommitEdit={onCommitEdit}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Enter" });
    expect(onCommitEdit).toHaveBeenCalledTimes(1);
  });

  it("編集中に Escape キーで onCancelEdit が呼ばれる", () => {
    const onCancelEdit = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
        onCancelEdit={onCancelEdit}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Escape" });
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it("非表示リストはタイトルに打ち消し線が入る", () => {
    render(
      <TodoListManagementItem
        {...defaultProps}
        list={createList({ isHidden: true })}
      />,
    );
    const btn = screen.getByLabelText("Inbox を開く");
    expect(btn.className).toContain("line-through");
  });

  it("編集中は編集ボタンを表示しない", () => {
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
      />,
    );
    expect(screen.queryByLabelText("Inbox を編集")).not.toBeInTheDocument();
  });
});
