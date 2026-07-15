import { act, renderHook } from "@testing-library/react";

jest.mock("../useTodoListInlineInsert", () => ({
  useTodoListInlineInsert: jest.fn(),
}));

jest.mock("../useTodoListDragAndDrop", () => ({
  useTodoListDragAndDrop: jest.fn(),
}));

import { useTodoListInlineInsert } from "../useTodoListInlineInsert";
import { useTodoListDragAndDrop } from "../useTodoListDragAndDrop";
import { useTodoListInteractionMode } from "../useTodoListInteractionMode";

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

const defaultParams = {
  listId: "list-1",
  items,
  onAddItem: jest.fn(),
  onReorderItems: jest.fn(),
  moveCompletedToBottom: false,
  hideCompleted: false,
};

describe("useTodoListInteractionMode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListInlineInsert as jest.Mock).mockReturnValue(inlineInsertMock);
    (useTodoListDragAndDrop as jest.Mock).mockReturnValue(dndMock);
  });

  describe("DnD の有効化（hideCompleted=trueなら常に有効、moveCompletedToBottom単独は無効）", () => {
    it("moveCompletedToBottom=false, hideCompleted=false のとき DnD は disabled=false で呼ばれる", () => {
      renderHook(() =>
        useTodoListInteractionMode({
          ...defaultParams,
          moveCompletedToBottom: false,
          hideCompleted: false,
        }),
      );
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false }),
      );
    });

    it("moveCompletedToBottom=true かつ hideCompleted=false のとき DnD は disabled=true で呼ばれる（完了状態の異なる親子ブロックの再構造化・境界跨ぎドラッグの無反応を防止）", () => {
      renderHook(() =>
        useTodoListInteractionMode({
          ...defaultParams,
          moveCompletedToBottom: true,
          hideCompleted: false,
        }),
      );
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: true }),
      );
    });

    it("moveCompletedToBottom=true かつ hideCompleted=true のときも DnD は disabled=false で呼ばれる", () => {
      renderHook(() =>
        useTodoListInteractionMode({
          ...defaultParams,
          moveCompletedToBottom: true,
          hideCompleted: true,
        }),
      );
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false }),
      );
    });

    it("moveCompletedToBottom=false かつ hideCompleted=true のときも DnD は disabled=false で呼ばれる", () => {
      renderHook(() =>
        useTodoListInteractionMode({
          ...defaultParams,
          moveCompletedToBottom: false,
          hideCompleted: true,
        }),
      );
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false }),
      );
    });
  });

  describe("ソートモード中のインライン挿入制御", () => {
    it("sortModeActive が false → true に変わると closeInlineInsert が呼ばれる", () => {
      const { rerender } = renderHook(
        ({ sortMode }: { sortMode: boolean }) =>
          useTodoListInteractionMode({
            ...defaultParams,
            moveCompletedToBottom: sortMode,
            hideCompleted: false,
          }),
        { initialProps: { sortMode: false } },
      );
      rerender({ sortMode: true });
      expect(closeInlineInsert).toHaveBeenCalledTimes(1);
    });

    it("sortModeActive=true のとき openInlineInsert は no-op になる", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode({
          ...defaultParams,
          moveCompletedToBottom: true,
          hideCompleted: false,
        }),
      );
      act(() => {
        result.current.inlineInsert.openInlineInsert("item-1");
      });
      expect(inlineInsertMock.openInlineInsert).not.toHaveBeenCalled();
    });

    it("sortModeActive=false のとき openInlineInsert は通常通り呼ばれる", () => {
      const { result } = renderHook(() =>
        useTodoListInteractionMode({
          ...defaultParams,
          moveCompletedToBottom: false,
        }),
      );
      act(() => {
        result.current.inlineInsert.openInlineInsert("item-1");
      });
      expect(inlineInsertMock.openInlineInsert).toHaveBeenCalledWith("item-1");
    });

    it("sortModeActive が true → false に戻っても closeInlineInsert は追加で呼ばれない", () => {
      const { rerender } = renderHook(
        ({ sortMode }: { sortMode: boolean }) =>
          useTodoListInteractionMode({
            ...defaultParams,
            moveCompletedToBottom: sortMode,
            hideCompleted: false,
          }),
        { initialProps: { sortMode: true } },
      );
      jest.clearAllMocks();
      rerender({ sortMode: false });
      expect(closeInlineInsert).not.toHaveBeenCalled();
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

  it("useTodoListDragAndDrop を正しいパラメータで呼ぶ", () => {
    renderHook(() => useTodoListInteractionMode(defaultParams));
    expect(useTodoListDragAndDrop).toHaveBeenCalledWith({
      items,
      listId: "list-1",
      onReorderItems: defaultParams.onReorderItems,
      onDragStarted: closeInlineInsert,
      disabled: false,
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
      expect(result.current.inlineInsert.closeInlineInsert).toBe(closeInlineInsert);
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
      expect(result.current.dnd.handleDragCancel).toBe(dndMock.handleDragCancel);
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
