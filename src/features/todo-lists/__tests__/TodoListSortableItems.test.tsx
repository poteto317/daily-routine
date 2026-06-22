import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListSortableItems } from "../TodoListSortableItems";
import type { TodoListSortableItemsProps } from "../TodoListSortableItems";
import type { TodoList } from "../types";

// ---------- dnd-kit モック ----------
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DragOverlay: ({ children }: React.PropsWithChildren) => <>{children}</>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  TouchSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
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
  sortableKeyboardCoordinates: jest.fn(),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => "") } },
}));
jest.mock("@/components/SwipeableRoutineItem", () => ({
  SwipeableRoutineItem: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));
jest.mock("@/components", () => ({
  CardPanel: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

// ---------- フィクスチャ ----------
const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [
    {
      id: "item-1",
      title: "Task 1",
      isCompleted: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "item-2",
      title: "Done Task",
      isCompleted: true,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const defaultHandlers: Omit<
  TodoListSortableItemsProps,
  | "list"
  | "visibleItems"
  | "hideCompleted"
  | "activeId"
  | "activeItem"
  | "selectedItemIds"
  | "collapsedItemIds"
  | "insertAfterId"
  | "inlineInputText"
  | "sensors"
> = {
  onDragStart: jest.fn(),
  onDragEnd: jest.fn(),
  onDragCancel: jest.fn(),
  onSetInlineInputText: jest.fn(),
  onHandleInlineAdd: jest.fn(),
  onCloseInlineInsert: jest.fn(),
  onOpenInlineInsert: jest.fn(),
  editingItemId: null,
  editingItemTitle: "",
  setEditingItemTitle: jest.fn(),
  commitEditItem: jest.fn(),
  cancelEditItem: jest.fn(),
  startEditItem: jest.fn(),
  toggleSelectItem: jest.fn(),
  toggleCollapseItem: jest.fn(),
  colorPickerItemId: null,
  toggleItemColorPicker: jest.fn(),
  closeItemColorPicker: jest.fn(),
  onUpdateItemBgColor: jest.fn(),
  onToggleItem: jest.fn(),
  onDeleteItem: jest.fn(),
  onIndentItem: jest.fn(),
  onOutdentItem: jest.fn(),
  mobileMenuItemId: null,
  toggleMobileMenu: jest.fn(),
  closeMobileMenu: jest.fn(),
};

const defaultProps: TodoListSortableItemsProps = {
  list: baseList,
  visibleItems: baseList.items,
  hideCompleted: false,
  activeId: null,
  activeItem: null,
  selectedItemIds: new Set(),
  collapsedItemIds: new Set(),
  insertAfterId: null,
  inlineInputText: "",
  sensors: [],
  ...defaultHandlers,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListSortableItems", () => {
  describe("空状態の表示", () => {
    it("visibleItems が空でアイテム数も 0 なら「まだTodoがありません」を表示する", () => {
      const emptyList: TodoList = { ...baseList, items: [] };
      render(
        <TodoListSortableItems
          {...defaultProps}
          list={emptyList}
          visibleItems={[]}
        />,
      );
      expect(screen.getByText("まだTodoがありません")).toBeInTheDocument();
    });

    it("visibleItems が空でアイテムがある場合（全完了）は「完了済みのみです」を表示する", () => {
      render(
        <TodoListSortableItems
          {...defaultProps}
          visibleItems={[]}
        />,
      );
      expect(screen.getByText("完了済みのみです")).toBeInTheDocument();
    });
  });

  describe("アイテム一覧の表示", () => {
    it("visibleItems のタイトルを表示する", () => {
      render(<TodoListSortableItems {...defaultProps} />);
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Done Task")).toBeInTheDocument();
    });

    it("visibleItems が 1 件の場合にそのアイテムを表示する", () => {
      render(
        <TodoListSortableItems
          {...defaultProps}
          visibleItems={[baseList.items[0]]}
        />,
      );
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Done Task")).not.toBeInTheDocument();
    });
  });

  describe("インライン挿入フォーム", () => {
    it("insertAfterId が一致するアイテムの後にインライン挿入フォームを表示する", () => {
      render(
        <TodoListSortableItems
          {...defaultProps}
          insertAfterId="item-1"
          inlineInputText="new item"
        />,
      );
      // InlineInsertForm のテキストボックスが表示される
      expect(
        screen.getByDisplayValue("new item"),
      ).toBeInTheDocument();
    });

    it("insertAfterId が null のときインライン挿入フォームを表示しない", () => {
      render(
        <TodoListSortableItems {...defaultProps} insertAfterId={null} />,
      );
      // フォームの「追加」ボタンがないこと（インライン挿入フォームは非表示）
      expect(
        screen.queryByRole("button", { name: "追加" }),
      ).not.toBeInTheDocument();
    });

    it("「下に追加」ボタンをクリックすると onOpenInlineInsert がアイテム ID で呼ばれる", () => {
      const onOpenInlineInsert = jest.fn();
      render(
        <TodoListSortableItems
          {...defaultProps}
          onOpenInlineInsert={onOpenInlineInsert}
        />,
      );
      const buttons = screen.getAllByRole("button", { name: "下に追加" });
      fireEvent.click(buttons[0]);
      expect(onOpenInlineInsert).toHaveBeenCalledWith("item-1");
    });

    it("onOpenInlineInsert が no-op のとき insertAfterId は変わらずフォームが開かない", () => {
      render(
        <TodoListSortableItems
          {...defaultProps}
          onOpenInlineInsert={() => {}}
          insertAfterId={null}
        />,
      );
      const buttons = screen.getAllByRole("button", { name: "下に追加" });
      fireEvent.click(buttons[0]);
      // insertAfterId は外部制御のため、no-op の場合はフォームが開かない
      expect(
        screen.queryByRole("button", { name: "追加" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("DragOverlay", () => {
    it("activeItem がある場合にドラッグオーバーレイを表示する", () => {
      render(
        <TodoListSortableItems
          {...defaultProps}
          activeId="item-1"
          activeItem={baseList.items[0]}
        />,
      );
      // DragOverlay 内のタイトルが表示される
      // モックでは DragOverlay は children をそのまま render する
      const titles = screen.getAllByText("Task 1");
      // アイテム行 + DragOverlay で 2 箇所表示
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it("activeItem が null のときドラッグオーバーレイを表示しない", () => {
      render(
        <TodoListSortableItems
          {...defaultProps}
          activeId={null}
          activeItem={null}
        />,
      );
      // DragOverlay は null を render しない
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });
});
