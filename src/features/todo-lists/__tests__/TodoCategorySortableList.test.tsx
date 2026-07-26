import { fireEvent, render, screen } from "@testing-library/react";
import { TodoCategorySortableList } from "../TodoCategorySortableList";
import type { TodoCategorySortableListProps } from "../TodoCategorySortableList";
import type { TodoCategory } from "../types";

// ---------- dnd-kit モック（TodoListSortableItems.test.tsxと同じ方針） ----------
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  closestCenter: jest.fn(),
}));
jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => "") } },
}));

const createCategory = (
  overrides: Partial<TodoCategory> = {},
): TodoCategory => ({
  id: "cat-1",
  name: "仕事",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const defaultProps: TodoCategorySortableListProps = {
  categories: [
    createCategory({ id: "cat-1", name: "仕事" }),
    createCategory({ id: "cat-2", name: "プライベート" }),
  ],
  sensors: [],
  onDragStart: jest.fn(),
  onDragEnd: jest.fn(),
  onDragCancel: jest.fn(),
  editingCategoryId: null,
  editingCategoryNameValue: "",
  onChangeNameValue: jest.fn(),
  onCommitEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onStartEdit: jest.fn(),
  colorEditingCategoryId: null,
  onToggleColorPicker: jest.fn(),
  onCloseColorPicker: jest.fn(),
  onUpdateColor: jest.fn(),
  onDelete: jest.fn(),
};

describe("TodoCategorySortableList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("カテゴリ一覧を表示する", () => {
    render(<TodoCategorySortableList {...defaultProps} />);
    expect(screen.getByText("🏷️ 仕事")).toBeInTheDocument();
    expect(screen.getByText("🏷️ プライベート")).toBeInTheDocument();
  });

  it("各カテゴリに並び替え用のドラッグハンドルを表示する", () => {
    render(<TodoCategorySortableList {...defaultProps} />);
    expect(screen.getAllByLabelText("並び替え").length).toBe(2);
  });

  it("編集ボタンをクリックするとonStartEditが呼ばれる", () => {
    const onStartEdit = jest.fn();
    render(
      <TodoCategorySortableList {...defaultProps} onStartEdit={onStartEdit} />,
    );
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    expect(onStartEdit).toHaveBeenCalledWith("cat-1", "仕事");
  });

  it("削除ボタンをクリックするとonDeleteが呼ばれる", () => {
    const onDelete = jest.fn();
    render(<TodoCategorySortableList {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("プライベート を削除"));
    expect(onDelete).toHaveBeenCalledWith(defaultProps.categories[1]);
  });

  it("editingCategoryIdが一致するカテゴリは編集用の入力欄を表示する", () => {
    render(
      <TodoCategorySortableList
        {...defaultProps}
        editingCategoryId="cat-1"
        editingCategoryNameValue="業務"
      />,
    );
    expect(screen.getByDisplayValue("業務")).toBeInTheDocument();
    expect(screen.queryByText("🏷️ 仕事")).not.toBeInTheDocument();
  });

  it("colorEditingCategoryIdが一致するカテゴリは色ピッカーを表示する", () => {
    render(
      <TodoCategorySortableList
        {...defaultProps}
        colorEditingCategoryId="cat-2"
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "背景色" })).toBeInTheDocument();
  });

  it("カテゴリが1件でも表示できる", () => {
    render(
      <TodoCategorySortableList
        {...defaultProps}
        categories={[defaultProps.categories[0]]}
      />,
    );
    expect(screen.getByText("🏷️ 仕事")).toBeInTheDocument();
    expect(screen.queryByText("🏷️ プライベート")).not.toBeInTheDocument();
  });
});
