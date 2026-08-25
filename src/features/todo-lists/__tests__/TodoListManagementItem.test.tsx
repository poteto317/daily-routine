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
  onChangeTitleValueAction: jest.fn(),
  onCommitEditAction: jest.fn(),
  onCancelEditAction: jest.fn(),
  onOpenListAction: jest.fn(),
  onToggleVisibilityAction: jest.fn(),
  onStartEditAction: jest.fn(),
  onDeleteAction: jest.fn(),
};

describe("TodoListManagementItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("リストタイトルを表示する", () => {
    render(<TodoListManagementItem {...defaultProps} />);
    expect(screen.getByText("✅ Inbox")).toBeInTheDocument();
  });

  it("タイトルをクリックすると onOpenListAction が呼ばれる", () => {
    const onOpenListAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        onOpenListAction={onOpenListAction}
      />,
    );
    fireEvent.click(screen.getByLabelText("Inbox を開く"));
    expect(onOpenListAction).toHaveBeenCalledWith("list-1");
  });

  it("表示切替ボタンをクリックすると onToggleVisibilityAction が呼ばれる", () => {
    const onToggleVisibilityAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        onToggleVisibilityAction={onToggleVisibilityAction}
      />,
    );
    fireEvent.click(screen.getByLabelText("Inbox の表示切替"));
    expect(onToggleVisibilityAction).toHaveBeenCalledWith(defaultProps.list);
  });

  it("編集ボタンをクリックすると onStartEditAction が呼ばれる", () => {
    const onStartEditAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        onStartEditAction={onStartEditAction}
      />,
    );
    fireEvent.click(screen.getByLabelText("Inbox を編集"));
    expect(onStartEditAction).toHaveBeenCalledWith("list-1", "Inbox");
  });

  it("削除ボタンをクリックすると onDeleteAction が呼ばれる", () => {
    const onDeleteAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        onDeleteAction={onDeleteAction}
      />,
    );
    fireEvent.click(screen.getByLabelText("Inbox を削除"));
    expect(onDeleteAction).toHaveBeenCalledWith(defaultProps.list);
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

  it("編集中に Enter キーで onCommitEditAction が呼ばれる", () => {
    const onCommitEditAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
        onCommitEditAction={onCommitEditAction}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Enter" });
    expect(onCommitEditAction).toHaveBeenCalledTimes(1);
  });

  it("IME変換中のEnterではonCommitEditActionを呼ばない", () => {
    const onCommitEditAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
        onCommitEditAction={onCommitEditAction}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), {
      key: "Enter",
      nativeEvent: { isComposing: true },
      isComposing: true,
    });
    expect(onCommitEditAction).not.toHaveBeenCalled();
  });

  it("IME変換確定のEnter（keyCode 229）でもonCommitEditActionを呼ばない", () => {
    const onCommitEditAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
        onCommitEditAction={onCommitEditAction}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), {
      key: "Enter",
      keyCode: 229,
      which: 229,
    });
    expect(onCommitEditAction).not.toHaveBeenCalled();
  });

  it("編集中に Escape キーで onCancelEditAction が呼ばれる", () => {
    const onCancelEditAction = jest.fn();
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
        onCancelEditAction={onCancelEditAction}
      />,
    );
    fireEvent.keyDown(screen.getByDisplayValue("テスト"), { key: "Escape" });
    expect(onCancelEditAction).toHaveBeenCalledTimes(1);
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
