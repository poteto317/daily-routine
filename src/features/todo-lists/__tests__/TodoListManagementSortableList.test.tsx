import { fireEvent, render, screen } from "@testing-library/react";
import {
  TodoListManagementSortableList,
  type TodoListManagementSortableListProps,
} from "../TodoListManagementSortableList";
import { restrictToSortableListBounds } from "../restrictToSortableListBounds";
import type { TodoList } from "../types";

// ---------- dnd-kit モック（TodoCategorySortableList.test.tsx と同じ方針。渡した props を控える） ----------
let mockDndContextProps: {
  sensors?: unknown;
  onDragEnd?: unknown;
  modifiers?: unknown;
} = {};
let mockSortableItems: unknown;

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    sensors,
    onDragEnd,
    modifiers,
  }: React.PropsWithChildren<{
    sensors?: unknown;
    onDragEnd?: unknown;
    modifiers?: unknown;
  }>) => {
    mockDndContextProps = { sensors, onDragEnd, modifiers };
    return <>{children}</>;
  },
  closestCenter: jest.fn(),
}));
jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({
    children,
    items,
  }: React.PropsWithChildren<{ items: unknown }>) => {
    mockSortableItems = items;
    return <>{children}</>;
  },
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

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-a",
  title: "買い物",
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const lists: TodoList[] = [
  createList({ id: "list-a", title: "買い物" }),
  createList({ id: "list-b", title: "仕事", isHidden: true }),
];
const sensors = [] as TodoListManagementSortableListProps["sensors"];

const createProps = (
  overrides: Partial<TodoListManagementSortableListProps> = {},
): TodoListManagementSortableListProps => ({
  lists,
  sensors,
  onDragEndAction: jest.fn(),
  editingListId: null,
  editingListTitleValue: "",
  onChangeTitleValueAction: jest.fn(),
  onCommitEditAction: jest.fn(),
  onCancelEditAction: jest.fn(),
  onOpenListAction: jest.fn(),
  onToggleVisibilityAction: jest.fn(),
  onStartEditAction: jest.fn(),
  onDeleteAction: jest.fn(),
  ...overrides,
});

describe("TodoListManagementSortableList", () => {
  beforeEach(() => {
    mockDndContextProps = {};
    mockSortableItems = undefined;
  });

  it("lists の順に行を表示し、各行に並び替えのボタンがある（非表示のリストも含む）", () => {
    render(<TodoListManagementSortableList {...createProps()} />);

    expect(
      screen
        .getAllByRole("button", { name: /を開く$/ })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["買い物 を開く", "仕事 を開く"]);
    expect(screen.getAllByRole("button", { name: "並び替え" })).toHaveLength(2);
  });

  it("DndContext に sensors と onDragEndAction を同じ参照のまま渡す", () => {
    const onDragEndAction = jest.fn();
    render(
      <TodoListManagementSortableList {...createProps({ onDragEndAction })} />,
    );

    expect(mockDndContextProps.sensors).toBe(sensors);
    expect(mockDndContextProps.onDragEnd).toBe(onDragEndAction);
  });

  it("DndContext に、行を一覧の枠の中に制限する modifier を渡す（下端までのドラッグでページが伸び続けるのを防ぐ）", () => {
    render(<TodoListManagementSortableList {...createProps()} />);

    expect(mockDndContextProps.modifiers).toEqual([
      restrictToSortableListBounds,
    ]);
  });

  it("再描画しても modifiers は同じ参照のまま渡す", () => {
    const { rerender } = render(
      <TodoListManagementSortableList {...createProps()} />,
    );
    const first = mockDndContextProps.modifiers;
    expect(first).toEqual([restrictToSortableListBounds]);
    rerender(<TodoListManagementSortableList {...createProps()} />);

    expect(mockDndContextProps.modifiers).toBe(first);
  });

  it("SortableContext の items は lists の順の ID", () => {
    render(<TodoListManagementSortableList {...createProps()} />);

    expect(mockSortableItems).toEqual(["list-a", "list-b"]);
  });

  it("各行の開く・表示切替・編集・削除が、その行のリストを引数にして呼ばれる", () => {
    const onOpenListAction = jest.fn();
    const onToggleVisibilityAction = jest.fn();
    const onStartEditAction = jest.fn();
    const onDeleteAction = jest.fn();
    render(
      <TodoListManagementSortableList
        {...createProps({
          onOpenListAction,
          onToggleVisibilityAction,
          onStartEditAction,
          onDeleteAction,
        })}
      />,
    );

    fireEvent.click(screen.getByLabelText("仕事 を開く"));
    fireEvent.click(screen.getByLabelText("仕事 の表示切替"));
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    fireEvent.click(screen.getByLabelText("仕事 を削除"));

    expect(onOpenListAction).toHaveBeenCalledWith("list-b");
    expect(onToggleVisibilityAction).toHaveBeenCalledWith(lists[1]);
    expect(onStartEditAction).toHaveBeenCalledWith("list-b", "仕事");
    expect(onDeleteAction).toHaveBeenCalledWith(lists[1]);
  });

  it("editingListId が一致する行だけが入力欄になり、入力・確定・取り消しが props に届く", () => {
    const onChangeTitleValueAction = jest.fn();
    const onCommitEditAction = jest.fn();
    const onCancelEditAction = jest.fn();
    render(
      <TodoListManagementSortableList
        {...createProps({
          editingListId: "list-a",
          editingListTitleValue: "食料品",
          onChangeTitleValueAction,
          onCommitEditAction,
          onCancelEditAction,
        })}
      />,
    );

    const input = screen.getByDisplayValue("食料品");
    expect(screen.queryByLabelText("買い物 を開く")).not.toBeInTheDocument();
    expect(screen.getByLabelText("仕事 を開く")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "日用品" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onChangeTitleValueAction).toHaveBeenCalledWith("日用品");
    expect(onCommitEditAction).toHaveBeenCalled();
    expect(onCancelEditAction).toHaveBeenCalled();
  });
});
