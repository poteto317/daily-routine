import { fireEvent, render, screen } from "@testing-library/react";
import { TodoCategorySortableList } from "../TodoCategorySortableList";
import { restrictToSortableListBounds } from "../restrictToSortableListBounds";
import type { TodoCategorySortableListProps } from "../TodoCategorySortableList";
import type { TodoCategory } from "../types";

// ---------- dnd-kit モック（TodoListSortableItems.test.tsxと同じ方針） ----------
let mockDndContextModifiers: unknown;

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    modifiers,
  }: React.PropsWithChildren<{ modifiers?: unknown }>) => {
    mockDndContextModifiers = modifiers;
    return <>{children}</>;
  },
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
  onDragStartAction: jest.fn(),
  onDragEndAction: jest.fn(),
  onDragCancelAction: jest.fn(),
  editingCategoryId: null,
  editingCategoryNameValue: "",
  onChangeNameValueAction: jest.fn(),
  onCommitEditAction: jest.fn(),
  onCancelEditAction: jest.fn(),
  onStartEditAction: jest.fn(),
  colorEditingCategoryId: null,
  onToggleColorPickerAction: jest.fn(),
  onCloseColorPickerAction: jest.fn(),
  onUpdateColorAction: jest.fn(),
  onDeleteAction: jest.fn(),
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

  it("編集ボタンをクリックするとonStartEditActionが呼ばれる", () => {
    const onStartEditAction = jest.fn();
    render(
      <TodoCategorySortableList
        {...defaultProps}
        onStartEditAction={onStartEditAction}
      />,
    );
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    expect(onStartEditAction).toHaveBeenCalledWith("cat-1", "仕事");
  });

  it("削除ボタンをクリックするとonDeleteActionが呼ばれる", () => {
    const onDeleteAction = jest.fn();
    render(
      <TodoCategorySortableList
        {...defaultProps}
        onDeleteAction={onDeleteAction}
      />,
    );
    fireEvent.click(screen.getByLabelText("プライベート を削除"));
    expect(onDeleteAction).toHaveBeenCalledWith(defaultProps.categories[1]);
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
    expect(
      screen.getByRole("radiogroup", { name: "背景色" }),
    ).toBeInTheDocument();
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

  it("DndContext に、行の中心を一覧の枠の中に制限する modifier を渡す（下端までのドラッグでページが伸び続けるのを防ぐ）", () => {
    render(<TodoCategorySortableList {...defaultProps} />);

    expect(mockDndContextModifiers).toEqual([restrictToSortableListBounds]);
  });

  it("再描画しても modifiers は同じ参照のまま渡す", () => {
    const { rerender } = render(<TodoCategorySortableList {...defaultProps} />);
    const first = mockDndContextModifiers;
    expect(first).toEqual([restrictToSortableListBounds]);
    rerender(<TodoCategorySortableList {...defaultProps} />);

    expect(mockDndContextModifiers).toBe(first);
  });
});
