import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailSelection", () => ({
  useTodoListDetailSelection: jest.fn(),
}));

jest.mock("../useTodoListDetailViewState", () => ({
  useTodoListDetailViewState: jest.fn(),
}));

jest.mock("../useTodoListDetailUIControllers", () => ({
  useTodoListDetailUIControllers: jest.fn(),
}));

jest.mock("../useTodoListInteractionMode", () => ({
  useTodoListInteractionMode: jest.fn(),
}));

jest.mock("../todoListDetailToolbarState", () => ({
  createToolbarState: jest.fn(),
}));

import { useTodoListDetailSelection } from "../useTodoListDetailSelection";
import { useTodoListDetailViewState } from "../useTodoListDetailViewState";
import { useTodoListDetailUIControllers } from "../useTodoListDetailUIControllers";
import { useTodoListInteractionMode } from "../useTodoListInteractionMode";
import { createToolbarState } from "../todoListDetailToolbarState";
import { useTodoListDetailViewComposition } from "../useTodoListDetailViewComposition";

const list = {
  id: "list-1",
  title: "Inbox",
  items: [
    {
      id: "item-1",
      title: "Task",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

const defaultParams = {
  list,
  clipboardItems: [],
  onAddItem: jest.fn(),
  onUpdateItemTitle: jest.fn(),
  onUpdateListTitle: jest.fn(),
  onCutItems: jest.fn(),
  onPasteItems: jest.fn(),
  onSetClipboard: jest.fn(),
  onClearClipboard: jest.fn(),
  onReorderItems: jest.fn(),
  onUpdateAllItemsBgColor: jest.fn(),
  onUpdateListAddItemPosition: jest.fn(),
};

const defaultViewStateMock = {
  hideCompleted: false,
  moveCompletedToBottom: false,
  collapsedItemIds: new Set<string>(),
  editingItemId: null,
  editingItemTitle: "",
  editingListTitle: false,
  editingListTitleValue: "",
  inputRef: { current: null },
  inputText: "",
  listTitleInputRef: { current: null },
  progress: { completed: 0, total: 1, percentage: 0 },
  visibleItems: list.items,
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
  toggleMoveCompletedToBottom: jest.fn(),
};

const defaultColorPickerMock = {
  colorPickerItemId: null,
  showBulkColorPicker: false,
  toggleItemColorPicker: jest.fn(),
  closeItemColorPicker: jest.fn(),
  toggleBulkColorPicker: jest.fn(),
  closeBulkColorPicker: jest.fn(),
};

const defaultMobileMenuMock = {
  mobileMenuItemId: null,
  toggleMobileMenu: jest.fn(),
  closeMobileMenu: jest.fn(),
};

const defaultUIControllersMock = {
  colorPicker: defaultColorPickerMock,
  mobileMenu: defaultMobileMenuMock,
};

const defaultInlineInsertMock = {
  insertAfterId: null,
  inlineInputText: "",
  setInlineInputText: jest.fn(),
  openInlineInsert: jest.fn(),
  closeInlineInsert: jest.fn(),
  handleInlineAdd: jest.fn(),
};

const defaultDndMock = {
  activeId: null,
  sensors: [],
  handleDragStart: jest.fn(),
  handleDragEnd: jest.fn(),
  handleDragCancel: jest.fn(),
};

const defaultInteractionModeMock = {
  inlineInsert: defaultInlineInsertMock,
  dnd: defaultDndMock,
  activeItem: null,
};

const defaultToolbarMock = {
  hasCompletedItems: false,
  handleUpdateAllItemsBgColor: jest.fn(),
  handleToggleAddItemPosition: jest.fn(),
};

describe("useTodoListDetailViewComposition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailSelection as jest.Mock).mockReturnValue({
      selectedItemIds: new Set(),
      toggleSelectItem: jest.fn(),
      clearSelection: jest.fn(),
      hasSelection: false,
      handleCut: jest.fn(),
      handlePaste: jest.fn(),
    });
    (useTodoListDetailViewState as jest.Mock).mockReturnValue(defaultViewStateMock);
    (useTodoListDetailUIControllers as jest.Mock).mockReturnValue(
      defaultUIControllersMock,
    );
    (useTodoListInteractionMode as jest.Mock).mockReturnValue(
      defaultInteractionModeMock,
    );
    (createToolbarState as jest.Mock).mockReturnValue(defaultToolbarMock);
  });

  it("useTodoListDetailSelection を正しいパラメータで呼ぶ", () => {
    renderHook(() => useTodoListDetailViewComposition(defaultParams));

    expect(useTodoListDetailSelection).toHaveBeenCalledWith({
      listId: "list-1",
      clipboardItems: [],
      onCutItems: defaultParams.onCutItems,
      onPasteItems: defaultParams.onPasteItems,
      onSetClipboard: defaultParams.onSetClipboard,
      onClearClipboard: defaultParams.onClearClipboard,
    });
  });

  it("useTodoListDetailViewState を正しいパラメータで呼ぶ", () => {
    renderHook(() => useTodoListDetailViewComposition(defaultParams));

    expect(useTodoListDetailViewState).toHaveBeenCalledWith({
      list,
      onAddItem: defaultParams.onAddItem,
      onUpdateItemTitle: defaultParams.onUpdateItemTitle,
      onUpdateListTitle: defaultParams.onUpdateListTitle,
    });
  });

  it("useTodoListDetailUIControllers を呼ぶ", () => {
    renderHook(() => useTodoListDetailViewComposition(defaultParams));

    expect(useTodoListDetailUIControllers).toHaveBeenCalled();
  });

  it("useTodoListInteractionMode を viewState の moveCompletedToBottom/hideCompleted とともに呼ぶ", () => {
    renderHook(() => useTodoListDetailViewComposition(defaultParams));

    expect(useTodoListInteractionMode).toHaveBeenCalledWith({
      listId: "list-1",
      items: list.items,
      onAddItem: defaultParams.onAddItem,
      onReorderItems: defaultParams.onReorderItems,
      moveCompletedToBottom: false,
      hideCompleted: false,
    });
  });

  it("viewState が moveCompletedToBottom=true のとき useTodoListInteractionMode に伝播する", () => {
    (useTodoListDetailViewState as jest.Mock).mockReturnValue({
      ...defaultViewStateMock,
      moveCompletedToBottom: true,
    });

    renderHook(() => useTodoListDetailViewComposition(defaultParams));

    expect(useTodoListInteractionMode).toHaveBeenCalledWith(
      expect.objectContaining({ moveCompletedToBottom: true }),
    );
  });

  it("viewState が hideCompleted=true のとき useTodoListInteractionMode に伝播する", () => {
    (useTodoListDetailViewState as jest.Mock).mockReturnValue({
      ...defaultViewStateMock,
      hideCompleted: true,
    });

    renderHook(() => useTodoListDetailViewComposition(defaultParams));

    expect(useTodoListInteractionMode).toHaveBeenCalledWith(
      expect.objectContaining({ hideCompleted: true }),
    );
  });

  describe("hasClipboard の導出", () => {
    it("clipboardItems が空のとき hasClipboard=false をトップレベルで返す", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition({ ...defaultParams, clipboardItems: [] }),
      );
      expect(result.current.hasClipboard).toBe(false);
    });

    it("clipboardItems に 1 件以上あるとき hasClipboard=true をトップレベルで返す", () => {
      const item = { id: "c-1", title: "T", isCompleted: false, createdAt: "" };
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition({
          ...defaultParams,
          clipboardItems: [item] as never,
        }),
      );
      expect(result.current.hasClipboard).toBe(true);
    });

    it("hasClipboard は selection グループには含まれない", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.selection).not.toHaveProperty("hasClipboard");
    });
  });

  it("全フックの戻り値をグループ構造で返す", () => {
    const { result } = renderHook(() =>
      useTodoListDetailViewComposition(defaultParams),
    );

    // selection グループ
    expect(result.current.selection.hasSelection).toBe(false);
    // hasClipboard はトップレベル
    expect(result.current.hasClipboard).toBe(false);
    // viewState グループ
    expect(result.current.viewState.hideCompleted).toBe(false);
    // uiControllers グループ: colorPicker / mobileMenu の名前付きサブグループ
    expect(result.current.uiControllers.colorPicker.showBulkColorPicker).toBe(false);
    expect(result.current.uiControllers.mobileMenu.mobileMenuItemId).toBeNull();
    // interactionMode グループ: inlineInsert / dnd の名前付きサブグループ
    expect(result.current.interactionMode.inlineInsert.insertAfterId).toBeNull();
    expect(result.current.interactionMode.dnd.activeId).toBeNull();
    expect(result.current.interactionMode.dnd.sensors).toEqual([]);
    expect(result.current.interactionMode.activeItem).toBeNull();
    // toolbar グループ
    expect(result.current.toolbar).toBeDefined();
    expect(result.current.toolbar.hasCompletedItems).toBe(false);
    expect(typeof result.current.toolbar.handleUpdateAllItemsBgColor).toBe("function");
    expect(typeof result.current.toolbar.handleToggleAddItemPosition).toBe("function");
  });

  describe("uiControllers の構造", () => {
    it("uiControllers は colorPicker と mobileMenu のサブグループを持つ", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.uiControllers.colorPicker).toBeDefined();
      expect(result.current.uiControllers.mobileMenu).toBeDefined();
    });

    it("colorPicker のプロパティが uiControllers トップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.uiControllers).not.toHaveProperty("colorPickerItemId");
      expect(result.current.uiControllers).not.toHaveProperty("showBulkColorPicker");
    });

    it("mobileMenu のプロパティが uiControllers トップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.uiControllers).not.toHaveProperty("mobileMenuItemId");
    });

    it("colorPicker が non-null のとき正しく伝播する", () => {
      (useTodoListDetailUIControllers as jest.Mock).mockReturnValue({
        colorPicker: { ...defaultColorPickerMock, colorPickerItemId: "item-5" },
        mobileMenu: defaultMobileMenuMock,
      });

      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.uiControllers.colorPicker.colorPickerItemId).toBe("item-5");
    });
  });

  describe("interactionMode の構造", () => {
    it("interactionMode は inlineInsert と dnd のサブグループを持つ", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.interactionMode.inlineInsert).toBeDefined();
      expect(result.current.interactionMode.dnd).toBeDefined();
    });

    it("inlineInsert のプロパティが interactionMode トップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.interactionMode).not.toHaveProperty("insertAfterId");
      expect(result.current.interactionMode).not.toHaveProperty("inlineInputText");
    });

    it("dnd のプロパティが interactionMode トップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.interactionMode).not.toHaveProperty("activeId");
      expect(result.current.interactionMode).not.toHaveProperty("sensors");
    });

    it("activeItem は interactionMode のトップレベルに配置される", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.interactionMode).toHaveProperty("activeItem");
    });
  });

  describe("toolbar グループ", () => {
    it("createToolbarState を list・onUpdateAllItemsBgColor・onUpdateListAddItemPosition で呼ぶ", () => {
      renderHook(() => useTodoListDetailViewComposition(defaultParams));

      expect(createToolbarState).toHaveBeenCalledWith({
        list,
        onUpdateAllItemsBgColor: defaultParams.onUpdateAllItemsBgColor,
        onUpdateListAddItemPosition: defaultParams.onUpdateListAddItemPosition,
      });
    });

    it("toolbar は createToolbarState の戻り値をそのまま返す", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current.toolbar).toBe(defaultToolbarMock);
    });

    it("toolbar のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListDetailViewComposition(defaultParams),
      );
      expect(result.current).not.toHaveProperty("hasCompletedItems");
      expect(result.current).not.toHaveProperty("handleUpdateAllItemsBgColor");
      expect(result.current).not.toHaveProperty("handleToggleAddItemPosition");
    });

    it("list が変わると createToolbarState に新しい list が渡る", () => {
      const newList = { ...list, id: "list-999" };
      renderHook(() =>
        useTodoListDetailViewComposition({ ...defaultParams, list: newList }),
      );
      expect(createToolbarState).toHaveBeenCalledWith(
        expect.objectContaining({ list: newList }),
      );
    });
  });
});
