import { act, renderHook } from "@testing-library/react";

jest.mock("../useTodoListInlineInsert", () => ({
  useTodoListInlineInsert: jest.fn(),
}));

jest.mock("../useTodoListDragAndDrop", () => ({
  useTodoListDragAndDrop: jest.fn(),
}));

jest.mock("../todoListItemReorderAction", () => ({
  reorderTodoItemsIfSameSection: jest.fn(),
}));

import { useTodoListInlineInsert } from "../useTodoListInlineInsert";
import { useTodoListDragAndDrop } from "../useTodoListDragAndDrop";
import { reorderTodoItemsIfSameSection } from "../todoListItemReorderAction";
import { useTodoListInteractionMode } from "../useTodoListInteractionMode";
import type { TodoCategory } from "../types";

const closeInlineInsert = jest.fn();

const inlineInsertMock = {
  insertAfterId: null,
  inlineInputText: "",
  setInlineInputText: jest.fn(),
  openInlineInsert: jest.fn(),
  closeInlineInsert,
  handleInlineAdd: jest.fn(),
};

const dndMock = {
  activeId: null,
  sensors: [],
  handleDragStart: jest.fn(),
  handleDragEnd: jest.fn(),
  handleDragCancel: jest.fn(),
};

const items = [
  {
    id: "item-1",
    title: "Task",
    isCompleted: false,
    createdAt: "2026-03-07T00:00:00.000Z",
  },
];

const categoryLookup = new Map<string, TodoCategory>();

const defaultParams = {
  listId: "list-1",
  items,
  categoryLookup,
  onAddItem: jest.fn(),
  onReorderItems: jest.fn(),
};

const getLastPassedOnReorderItems = () =>
  (useTodoListDragAndDrop as jest.Mock).mock.calls.at(-1)![0].onReorderItems;

describe("useTodoListInteractionMode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListInlineInsert as jest.Mock).mockReturnValue(inlineInsertMock);
    (useTodoListDragAndDrop as jest.Mock).mockReturnValue(dndMock);
  });

  describe("表示順は常に固定ソートされるが、DnDは同一セクション内のみ許可される", () => {
    it("DnD には disabled が渡されない（常時センサー有効、可否はラップされた onReorderItems 側で判定）", () => {
      renderHook(() => useTodoListInteractionMode(defaultParams));
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.not.objectContaining({ disabled: expect.anything() }),
      );
    });

    it("useTodoListDragAndDrop には categoryLookup を渡さない（DnDフックはドメイン非依存のまま）", () => {
      renderHook(() => useTodoListInteractionMode(defaultParams));
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.not.objectContaining({ categoryLookup: expect.anything() }),
      );
    });

    it("sortModeActive は常に true", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.sortModeActive).toBe(true);
    });

    it("openInlineInsert は常に no-op になる", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      act(() => {
        result.current.inlineInsert.openInlineInsert("item-1");
      });
      expect(inlineInsertMock.openInlineInsert).not.toHaveBeenCalled();
    });

    it("マウント時に closeInlineInsert が呼ばれ、インライン挿入フォームは閉じられる", () => {
      renderHook(() => useTodoListInteractionMode(defaultParams));
      expect(closeInlineInsert).toHaveBeenCalled();
    });
  });

  it("useTodoListInlineInsert を正しいパラメータで呼ぶ", () => {
    renderHook(() => useTodoListInteractionMode(defaultParams));
    expect(useTodoListInlineInsert).toHaveBeenCalledWith({
      listId: "list-1",
      onAddItem: defaultParams.onAddItem,
    });
  });

  it("closeInlineInsert を useTodoListDragAndDrop の onDragStarted として渡す", () => {
    renderHook(() => useTodoListInteractionMode(defaultParams));
    expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
      expect.objectContaining({ onDragStarted: closeInlineInsert }),
    );
  });

  it("useTodoListDragAndDrop を正しいパラメータで呼ぶ（onReorderItemsは同一セクション判定でラップされた関数）", () => {
    renderHook(() => useTodoListInteractionMode(defaultParams));
    expect(useTodoListDragAndDrop).toHaveBeenCalledWith({
      items,
      listId: "list-1",
      onReorderItems: expect.any(Function),
      onDragStarted: closeInlineInsert,
    });
    expect(getLastPassedOnReorderItems()).not.toBe(
      defaultParams.onReorderItems,
    );
  });

  describe("同一セクション判定（reorderTodoItemsIfSameSectionへの配線）", () => {
    // 同一セクション判定ロジック自体の網羅的なテストは
    // todoListItemReorderAction.test.ts の責務。ここでは
    // useTodoListDragAndDrop へ渡された onReorderItems を呼び出すと
    // reorderTodoItemsIfSameSection が正しい引数で呼ばれることのみを検証する。
    it("渡された onReorderItems を呼び出すと reorderTodoItemsIfSameSection を正しい引数で呼ぶ", () => {
      const onReorderItems = jest.fn();
      renderHook(() =>
        useTodoListInteractionMode({ ...defaultParams, onReorderItems }),
      );

      act(() => {
        getLastPassedOnReorderItems()("list-1", 0, 1);
      });

      expect(reorderTodoItemsIfSameSection).toHaveBeenCalledWith({
        items,
        categoryLookup,
        listId: "list-1",
        fromIndex: 0,
        toIndex: 1,
        onReorderItems,
      });
    });

    it("useTodoListDragAndDrop から渡されるコールバック自身の listId 引数は無視し、常に外側の listId を使う", () => {
      const onReorderItems = jest.fn();
      renderHook(() =>
        useTodoListInteractionMode({ ...defaultParams, onReorderItems }),
      );

      // useTodoListDragAndDrop は常に自身が構築時に受け取った listId
      // （= defaultParams.listId）をそのままコールバックへ返すため、実際には
      // 異なる値が渡ることはない。ここではその不変条件が破られた場合でも
      // 外側の listId が優先されることを検証する。
      act(() => {
        getLastPassedOnReorderItems()("some-other-list-id", 0, 1);
      });

      expect(reorderTodoItemsIfSameSection).toHaveBeenCalledWith(
        expect.objectContaining({ listId: "list-1" }),
      );
    });
  });

  describe("inlineInsert グループ", () => {
    it("inlineInsert プロパティが存在する", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.inlineInsert).toBeDefined();
    });

    it("inlineInsert に useTodoListInlineInsert の戻り値が入る", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.inlineInsert.insertAfterId).toBeNull();
      expect(result.current.inlineInsert.inlineInputText).toBe("");
      expect(result.current.inlineInsert.closeInlineInsert).toBe(
        closeInlineInsert,
      );
    });

    it("inlineInsert のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current).not.toHaveProperty("insertAfterId");
      expect(result.current).not.toHaveProperty("inlineInputText");
      expect(result.current).not.toHaveProperty("handleInlineAdd");
    });
  });

  describe("dnd グループ", () => {
    it("dnd プロパティが存在する", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.dnd).toBeDefined();
    });

    it("dnd に useTodoListDragAndDrop の戻り値が入る", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.dnd.activeId).toBeNull();
      expect(result.current.dnd.sensors).toEqual([]);
      expect(result.current.dnd.handleDragStart).toBe(dndMock.handleDragStart);
      expect(result.current.dnd.handleDragEnd).toBe(dndMock.handleDragEnd);
      expect(result.current.dnd.handleDragCancel).toBe(
        dndMock.handleDragCancel,
      );
    });

    it("dnd のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current).not.toHaveProperty("activeId");
      expect(result.current).not.toHaveProperty("sensors");
      expect(result.current).not.toHaveProperty("handleDragStart");
    });
  });

  describe("activeItem の導出", () => {
    it("activeId=null のとき activeItem=null を返す", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.activeItem).toBeNull();
    });

    it("activeId がアイテム ID と一致するとき activeItem を返す", () => {
      (useTodoListDragAndDrop as jest.Mock).mockReturnValue({
        ...dndMock,
        activeId: "item-1",
      });
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.activeItem).toEqual(
        expect.objectContaining({ id: "item-1" }),
      );
    });

    it("activeId がアイテムに存在しないとき null を返す", () => {
      (useTodoListDragAndDrop as jest.Mock).mockReturnValue({
        ...dndMock,
        activeId: "unknown-id",
      });
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.activeItem).toBeNull();
    });
  });

  describe("グループ分離", () => {
    it("inlineInsert と dnd は独立したオブジェクトとして返される", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode(defaultParams),
      );
      expect(result.current.inlineInsert).not.toBe(result.current.dnd);
    });
  });
});
