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
  onChangeListTitleValueAction: jest.fn(),
  onCommitEditListTitleAction: jest.fn(),
  onCancelEditListTitleAction: jest.fn(),
  onStartEditListTitleAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListHeader", () => {
  it("通常時にリストタイトルを表示する", () => {
    render(<TodoListHeader {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "テストリスト" }),
    ).toBeInTheDocument();
  });

  it("通常時に編集ボタンを表示する", () => {
    render(<TodoListHeader {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "リスト名を編集" }),
    ).toBeInTheDocument();
  });

  it("編集ボタンクリックで onStartEditListTitleAction が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "リスト名を編集" }));
    expect(defaultProps.onStartEditListTitleAction).toHaveBeenCalledTimes(1);
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

  it("入力変更で onChangeListTitleValueAction が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "新タイトル" },
    });
    expect(defaultProps.onChangeListTitleValueAction).toHaveBeenCalledWith(
      "新タイトル",
    );
  });

  it("Enter キーで onCommitEditListTitleAction が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(defaultProps.onCommitEditListTitleAction).toHaveBeenCalledTimes(1);
  });

  it("Escape キーで onCancelEditListTitleAction が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(defaultProps.onCancelEditListTitleAction).toHaveBeenCalledTimes(1);
  });

  it("Blur で onCommitEditListTitleAction が呼ばれる", () => {
    render(<TodoListHeader {...defaultProps} editingListTitle />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(defaultProps.onCommitEditListTitleAction).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンは表示されない（リスト削除は管理画面からのみ行う）", () => {
    render(<TodoListHeader {...defaultProps} />);
    expect(
      screen.queryByRole("button", { name: "リストを削除" }),
    ).not.toBeInTheDocument();
  });
});
