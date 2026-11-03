import { fireEvent, render, screen } from "@testing-library/react";
import { useSortable } from "@dnd-kit/sortable";
import { TodoListManagementItem } from "../TodoListManagementItem";
import type { TodoList } from "../types";

// 行の dnd-kit の配線（useSortable に渡す id・ハンドルの listeners・行の ref）を固定する。
// TodoListManagementItem.test.tsx は本物の useSortable を使うので、モックはこのファイルに分ける。
const mockOnKeyDown = jest.fn();
const mockSetNodeRef = jest.fn();
jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: { onKeyDown: mockOnKeyDown },
    setNodeRef: mockSetNodeRef,
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}));

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const defaultProps = {
  list,
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

describe("TodoListManagementItem の dnd-kit の配線", () => {
  beforeEach(() => {
    mockOnKeyDown.mockClear();
    mockSetNodeRef.mockClear();
    jest.mocked(useSortable).mockClear();
  });

  it("useSortable にリストの ID を渡し、listeners をハンドルに、ref を行に付ける", () => {
    render(<TodoListManagementItem {...defaultProps} />);

    // active.id がリストの ID になる（reorderTodoListsInMenuOrder が ID で照合する）
    expect(useSortable).toHaveBeenCalledWith({ id: "list-1" });

    // listeners がハンドルに付く（外れるとドラッグが始まらない）
    const handle = screen.getByRole("button", { name: "並び替え" });
    fireEvent.keyDown(handle, { key: " " });
    expect(mockOnKeyDown).toHaveBeenCalledTimes(1);

    // setNodeRef が行の要素に付く（ハンドルを含む行全体が並び替えの対象になる）
    expect(mockSetNodeRef).toHaveBeenCalled();
    expect(mockSetNodeRef.mock.calls[0][0]).toContainElement(handle);
  });
});
