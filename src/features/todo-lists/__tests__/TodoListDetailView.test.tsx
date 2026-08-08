import { render, screen } from "@testing-library/react";

jest.mock("../useTodoListDetailViewComposition", () => ({
  useTodoListDetailViewComposition: jest.fn(),
}));

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../TodoListHeader", () => ({
  TodoListHeader: jest.fn(() => <div data-testid="list-header" />),
}));

jest.mock("../TodoListProgressBar", () => ({
  TodoListProgressBar: jest.fn(() => <div data-testid="progress-bar" />),
}));

jest.mock("../TodoListToolbar", () => ({
  TodoListToolbar: jest.fn(({ historyControls }: { historyControls?: React.ReactNode }) => (
    <div data-testid="toolbar">{historyControls}</div>
  )),
}));

jest.mock("../TodoListActionStatusBar", () => ({
  TodoListActionStatusBar: jest.fn(() => <div data-testid="action-status-bar" />),
}));

jest.mock("../TodoListSortableItems", () => ({
  TodoListSortableItems: jest.fn(() => <div data-testid="sortable-items" />),
}));

jest.mock("../TodoListAddForm", () => ({
  TodoListAddForm: jest.fn(() => <div data-testid="add-form" />),
}));

import { useTodoListDetailViewComposition } from "../useTodoListDetailViewComposition";
import { TodoListToolbar } from "../TodoListToolbar";
import { TodoListActionStatusBar } from "../TodoListActionStatusBar";
import { TodoListDetailView } from "../TodoListDetailView";

const list = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

const defaultProps = {
  list,
  categories: [],
  clipboardItems: [],
  onAddItemAction: jest.fn(),
  onToggleItemAction: jest.fn(),
  onDeleteItemAction: jest.fn(),
  onIndentItemAction: jest.fn(),
  onOutdentItemAction: jest.fn(),
  onReorderItemsAction: jest.fn(),
  onUpdateItemTitleAction: jest.fn(),
  onUpdateListTitleAction: jest.fn(),
  onUpdateItemBgColorAction: jest.fn(),
  onUpdateAllItemsBgColorAction: jest.fn(),
  onCutItemsAction: jest.fn(),
  onPasteItemsAction: jest.fn(),
  onSetClipboardAction: jest.fn(),
  onClearClipboardAction: jest.fn(),
  onUpdateListAddItemPositionAction: jest.fn(),
  onUpdateListHideCompletedAction: jest.fn(),
  onUpdateItemCategoryAction: jest.fn(),
};

const defaultCompositionMock = {
  selection: {
    selectedItemIds: new Set<string>(),
    toggleSelectItem: jest.fn(),
    clearSelection: jest.fn(),
    hasSelection: false,
    handleCut: jest.fn(),
    handlePaste: jest.fn(),
  },
  hasClipboard: false,
  viewState: {
    hideCompleted: false,
    categoryLookup: new Map(),
    collapsedItemIds: new Set<string>(),
    editingItemId: null,
    editingItemTitle: "",
    editingListTitle: false,
    editingListTitleValue: "",
    inputRef: { current: null },
    inputText: "",
    listTitleInputRef: { current: null },
    progress: { completed: 0, total: 0, percentage: 0 },
    visibleItems: [],
    setEditingItemTitle: jest.fn(),
    setEditingListTitleValue: jest.fn(),
    setInputText: jest.fn(),
    cancelEditItem: jest.fn(),
    cancelEditListTitle: jest.fn(),
    commitEditItem: jest.fn(),
    commitEditListTitle: jest.fn(),
    handleAdd: jest.fn(),
    startEditItem: jest.fn(),
    startEditListTitle: jest.fn(),
    toggleCollapseItem: jest.fn(),
    toggleHideCompleted: jest.fn(),
  },
  uiControllers: {
    colorPicker: {
      colorPickerItemId: null,
      showBulkColorPicker: false,
      toggleItemColorPicker: jest.fn(),
      closeItemColorPicker: jest.fn(),
      toggleBulkColorPicker: jest.fn(),
      closeBulkColorPicker: jest.fn(),
    },
    itemMenu: {
      itemMenuItemId: null,
      toggleItemMenu: jest.fn(),
      closeItemMenu: jest.fn(),
    },
  },
  interactionMode: {
    inlineInsert: {
      insertAfterId: null,
      inlineInputText: "",
      setInlineInputText: jest.fn(),
      openInlineInsert: jest.fn(),
      closeInlineInsert: jest.fn(),
      handleInlineAdd: jest.fn(),
    },
    dnd: {
      activeId: null,
      sensors: [],
      handleDragStart: jest.fn(),
      handleDragEnd: jest.fn(),
      handleDragCancel: jest.fn(),
    },
    activeItem: null,
    sortModeActive: false,
  },
  toolbar: {
    hasCompletedItems: false,
    handleUpdateAllItemsBgColor: jest.fn(),
    handleToggleAddItemPosition: jest.fn(),
  },
};

describe("TodoListDetailView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailViewComposition as jest.Mock).mockReturnValue(defaultCompositionMock);
  });

  it("useTodoListDetailViewComposition を view 操作に必要なパラメータで呼ぶ", () => {
    render(<TodoListDetailView {...defaultProps} />);

    expect(useTodoListDetailViewComposition).toHaveBeenCalledWith({
      list,
      categories: defaultProps.categories,
      clipboardItems: [],
      onAddItem: defaultProps.onAddItemAction,
      onUpdateItemTitle: defaultProps.onUpdateItemTitleAction,
      onUpdateListTitle: defaultProps.onUpdateListTitleAction,
      onCutItems: defaultProps.onCutItemsAction,
      onPasteItems: defaultProps.onPasteItemsAction,
      onSetClipboard: defaultProps.onSetClipboardAction,
      onClearClipboard: defaultProps.onClearClipboardAction,
      onReorderItems: defaultProps.onReorderItemsAction,
      onUpdateAllItemsBgColor: defaultProps.onUpdateAllItemsBgColorAction,
      onUpdateListAddItemPosition: defaultProps.onUpdateListAddItemPositionAction,
      onUpdateListHideCompleted: defaultProps.onUpdateListHideCompletedAction,
    });
  });

  it("ヘッダー・進捗バー・ツールバー・アイテム・追加フォームを常に表示する", () => {
    render(<TodoListDetailView {...defaultProps} />);

    expect(screen.getByTestId("list-header")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
    expect(screen.getByTestId("toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("sortable-items")).toBeInTheDocument();
    expect(screen.getByTestId("add-form")).toBeInTheDocument();
  });

  it("historyControls を TodoListToolbar に渡す", () => {
    const historyControls = <span data-testid="history-slot">↩↪</span>;
    render(<TodoListDetailView {...defaultProps} historyControls={historyControls} />);

    expect(screen.getByTestId("history-slot")).toBeInTheDocument();
    expect(TodoListToolbar).toHaveBeenCalledWith(
      expect.objectContaining({ historyControls }),
      undefined,
    );
  });

  it("historyControls が未指定のとき TodoListToolbar に undefined を渡す", () => {
    render(<TodoListDetailView {...defaultProps} />);

    expect(TodoListToolbar).toHaveBeenCalledWith(
      expect.objectContaining({ historyControls: undefined }),
      undefined,
    );
  });

  describe("TodoListToolbar への委譲", () => {
    it("viewState の hideCompleted を TodoListToolbar に渡す", () => {
      const composition = {
        ...defaultCompositionMock,
        viewState: {
          ...defaultCompositionMock.viewState,
          hideCompleted: true,
        },
      };
      (useTodoListDetailViewComposition as jest.Mock).mockReturnValue(composition);

      render(<TodoListDetailView {...defaultProps} />);

      expect(TodoListToolbar).toHaveBeenCalledWith(
        expect.objectContaining({
          hideCompleted: true,
        }),
        undefined,
      );
    });

    it("toolbar.hasCompletedItems=true のとき TodoListToolbar に hasCompletedItems=true を渡す", () => {
      (useTodoListDetailViewComposition as jest.Mock).mockReturnValue({
        ...defaultCompositionMock,
        toolbar: { ...defaultCompositionMock.toolbar, hasCompletedItems: true },
      });

      render(<TodoListDetailView {...defaultProps} />);

      expect(TodoListToolbar).toHaveBeenCalledWith(
        expect.objectContaining({ hasCompletedItems: true }),
        undefined,
      );
    });

    it("toolbar.hasCompletedItems=false のとき TodoListToolbar に hasCompletedItems=false を渡す", () => {
      render(<TodoListDetailView {...defaultProps} />);

      expect(TodoListToolbar).toHaveBeenCalledWith(
        expect.objectContaining({ hasCompletedItems: false }),
        undefined,
      );
    });

    it("toolbar.handleUpdateAllItemsBgColor を TodoListToolbar の onUpdateAllItemsBgColorAction にそのまま渡す", () => {
      render(<TodoListDetailView {...defaultProps} />);

      expect(TodoListToolbar).toHaveBeenCalledWith(
        expect.objectContaining({
          onUpdateAllItemsBgColorAction: defaultCompositionMock.toolbar.handleUpdateAllItemsBgColor,
        }),
        undefined,
      );
    });

    it("toolbar.handleToggleAddItemPosition を TodoListToolbar の onToggleListAddItemPositionAction にそのまま渡す", () => {
      render(<TodoListDetailView {...defaultProps} />);

      expect(TodoListToolbar).toHaveBeenCalledWith(
        expect.objectContaining({
          onToggleListAddItemPositionAction: defaultCompositionMock.toolbar.handleToggleAddItemPosition,
        }),
        undefined,
      );
    });

    it("colorPicker の showBulkColorPicker を TodoListToolbar に渡す", () => {
      const composition = {
        ...defaultCompositionMock,
        uiControllers: {
          ...defaultCompositionMock.uiControllers,
          colorPicker: {
            ...defaultCompositionMock.uiControllers.colorPicker,
            showBulkColorPicker: true,
          },
        },
      };
      (useTodoListDetailViewComposition as jest.Mock).mockReturnValue(composition);

      render(<TodoListDetailView {...defaultProps} />);

      expect(TodoListToolbar).toHaveBeenCalledWith(
        expect.objectContaining({ showBulkColorPicker: true }),
        undefined,
      );
    });
  });

  describe("TodoListActionStatusBar への委譲", () => {
    it("TodoListActionStatusBar を描画する", () => {
      render(<TodoListDetailView {...defaultProps} />);

      expect(screen.getByTestId("action-status-bar")).toBeInTheDocument();
    });

    it("selection/clipboard の状態と操作を TodoListActionStatusBar に渡す", () => {
      const handleCut = jest.fn();
      const clearSelection = jest.fn();
      const handlePaste = jest.fn();
      const composition = {
        ...defaultCompositionMock,
        hasClipboard: true,
        selection: {
          ...defaultCompositionMock.selection,
          hasSelection: true,
          selectedItemIds: new Set(["item-1", "item-2"]),
          handleCut,
          clearSelection,
          handlePaste,
        },
      };
      (useTodoListDetailViewComposition as jest.Mock).mockReturnValue(composition);

      const props = { ...defaultProps, clipboardItems: [{ id: "c-1" }] as never };
      render(<TodoListDetailView {...props} />);

      expect(TodoListActionStatusBar).toHaveBeenCalledWith(
        expect.objectContaining({
          hasSelection: true,
          hasClipboard: true,
          selectedCount: 2,
          clipboardCount: 1,
          onCutAction: handleCut,
          onClearSelectionAction: clearSelection,
          onPasteAction: handlePaste,
          onClearClipboardAction: defaultProps.onClearClipboardAction,
        }),
        undefined,
      );
    });
  });
});
