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
};

describe("useTodoListInteractionMode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListInlineInsert as jest.Mock).mockReturnValue(inlineInsertMock);
    (useTodoListDragAndDrop as jest.Mock).mockReturnValue(dndMock);
  });

  describe("表示順が常に固定ソートされるため、DnD・インライン挿入は常時無効", () => {
    it("DnD は常に disabled=true で呼ばれる", () => {
      renderHook(() => useTodoListInteractionMode(defaultParams));
      expect(useTodoListDragAndDrop).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: true }),
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

  it("useTodoListDragAndDrop を正しいパラメータで呼ぶ", () => {
    renderHook(() => useTodoListInteractionMode(defaultParams));
    expect(useTodoListDragAndDrop).toHaveBeenCalledWith({
      items,
      listId: "list-1",
      onReorderItems: defaultParams.onReorderItems,
      onDragStarted: closeInlineInsert,
      disabled: true,
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
