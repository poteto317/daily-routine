import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListHeader } from "../TodoListHeader";
import type { TodoList } from "../types";

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "テストリスト",
  items: [],
  addItemPosition: "last",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const defaultProps = {
  list: createList(),
  editingListTitle: false,
  editingListTitleValue: "テストリスト",
  listTitleInputRef: { current: null },
  onChangeListTitleValue: jest.fn(),
  onCommitEditListTitle: jest.fn(),
  onCancelEditListTitle: jest.fn(),
  onStartEditListTitle: jest.fn(),
  onDeleteList: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListHeader", () => {
  it("通常時にリストタイトルを表示する", () => {
    render(<TodoListHeader {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "テストリスト" })).toBeInTheDocument();
  });

  it("通常時に編集ボタンを表示する", () => {
    render(<TodoListHeader {...defaultProps} />);
    expect(screen.getByRole("button", { name: "リスト名を編集" })).toBeInTheDocument();
  });

  it("編集ボタンクリックで onStartEditListTitle が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "リスト名を編集" }));
    expect(defaultProps.onStartEditListTitle).toHaveBeenCalledTimes(1);
  });

  it("editingListTitle=true のときテキスト入力フィールドを表示する", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("入力フィールドの値が editingListTitleValue と一致する", () => {
    render(
      <TodoListHeader
        {...defaultProps}
        editingListTitle
        editingListTitleValue="変更中タイトル"
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("変更中タイトル");
  });

  it("入力変更で onChangeListTitleValue が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "新タイトル" },
    });
    expect(defaultProps.onChangeListTitleValue).toHaveBeenCalledWith("新タイトル");
  });

  it("Enter キーで onCommitEditListTitle が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(defaultProps.onCommitEditListTitle).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancelEditListTitle が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(defaultProps.onCancelEditListTitle).toHaveBeenCalledTimes(1);
  });

  it("Blur で onCommitEditListTitle が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(defaultProps.onCommitEditListTitle).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンクリックで onDeleteList が list を渡して呼ばれる", () => {
    const list = createList();
    render(<TodoListHeader {...defaultProps} list={list} />);
    fireEvent.click(screen.getByRole("button", { name: "リストを削除" }));
    expect(defaultProps.onDeleteList).toHaveBeenCalledWith(list);
  });
});
