import { createToolbarState } from "../todoListDetailToolbarState";
import type { TodoList } from "../types";

const makeList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const makeParams = (
  overrides: Partial<Parameters<typeof createToolbarState>[0]> = {},
) => ({
  list: makeList(),
  onUpdateAllItemsBgColor: jest.fn(),
  onUpdateListAddItemPosition: jest.fn(),
  ...overrides,
});

describe("createToolbarState", () => {
  describe("hasCompletedItems の計算", () => {
    it("アイテムがないとき false を返す", () => {
      const { hasCompletedItems } = createToolbarState(makeParams());
      expect(hasCompletedItems).toBe(false);
    });

    it("完了済みアイテムがないとき false を返す", () => {
      const list = makeList({
        items: [
          { id: "i-1", title: "Task A", isCompleted: false, createdAt: "" },
          { id: "i-2", title: "Task B", isCompleted: false, createdAt: "" },
        ],
      });
      const { hasCompletedItems } = createToolbarState(makeParams({ list }));
      expect(hasCompletedItems).toBe(false);
    });

    it("1 件でも完了済みアイテムがあるとき true を返す", () => {
      const list = makeList({
        items: [
          { id: "i-1", title: "Done", isCompleted: true, createdAt: "" },
          { id: "i-2", title: "Todo", isCompleted: false, createdAt: "" },
        ],
      });
      const { hasCompletedItems } = createToolbarState(makeParams({ list }));
      expect(hasCompletedItems).toBe(true);
    });

    it("全アイテムが完了済みのとき true を返す", () => {
      const list = makeList({
        items: [
          { id: "i-1", title: "Done A", isCompleted: true, createdAt: "" },
          { id: "i-2", title: "Done B", isCompleted: true, createdAt: "" },
        ],
      });
      const { hasCompletedItems } = createToolbarState(makeParams({ list }));
      expect(hasCompletedItems).toBe(true);
    });
  });

  describe("handleUpdateAllItemsBgColor", () => {
    it("list.id を補完して onUpdateAllItemsBgColor を呼ぶ", () => {
      const onUpdateAllItemsBgColor = jest.fn();
      const list = makeList({ id: "list-42" });
      const { handleUpdateAllItemsBgColor } = createToolbarState(
        makeParams({ list, onUpdateAllItemsBgColor }),
      );

      handleUpdateAllItemsBgColor("bg-red-50");

      expect(onUpdateAllItemsBgColor).toHaveBeenCalledWith(
        "list-42",
        "bg-red-50",
      );
    });

    it("undefined を渡すと list.id とともに undefined を呼ぶ", () => {
      const onUpdateAllItemsBgColor = jest.fn();
      const { handleUpdateAllItemsBgColor } = createToolbarState(
        makeParams({ onUpdateAllItemsBgColor }),
      );

      handleUpdateAllItemsBgColor(undefined);

      expect(onUpdateAllItemsBgColor).toHaveBeenCalledWith("list-1", undefined);
    });

    it("異なる bgColor 値を渡すと正しく転送される", () => {
      const onUpdateAllItemsBgColor = jest.fn();
      const { handleUpdateAllItemsBgColor } = createToolbarState(
        makeParams({ onUpdateAllItemsBgColor }),
      );

      handleUpdateAllItemsBgColor("bg-blue-50");

      expect(onUpdateAllItemsBgColor).toHaveBeenCalledWith(
        "list-1",
        "bg-blue-50",
      );
    });

    it("onUpdateAllItemsBgColor は 1 度しか呼ばれない", () => {
      const onUpdateAllItemsBgColor = jest.fn();
      const { handleUpdateAllItemsBgColor } = createToolbarState(
        makeParams({ onUpdateAllItemsBgColor }),
      );

      handleUpdateAllItemsBgColor("bg-red-50");

      expect(onUpdateAllItemsBgColor).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleToggleAddItemPosition", () => {
    it("'first' を渡すと list.id とともに 'first' を呼ぶ", () => {
      const onUpdateListAddItemPosition = jest.fn();
      const list = makeList({ id: "list-99" });
      const { handleToggleAddItemPosition } = createToolbarState(
        makeParams({ list, onUpdateListAddItemPosition }),
      );

      handleToggleAddItemPosition("first");

      expect(onUpdateListAddItemPosition).toHaveBeenCalledWith(
        "list-99",
        "first",
      );
    });

    it("'last' を渡すと list.id とともに 'last' を呼ぶ", () => {
      const onUpdateListAddItemPosition = jest.fn();
      const { handleToggleAddItemPosition } = createToolbarState(
        makeParams({ onUpdateListAddItemPosition }),
      );

      handleToggleAddItemPosition("last");

      expect(onUpdateListAddItemPosition).toHaveBeenCalledWith(
        "list-1",
        "last",
      );
    });

    it("onUpdateListAddItemPosition は 1 度しか呼ばれない", () => {
      const onUpdateListAddItemPosition = jest.fn();
      const { handleToggleAddItemPosition } = createToolbarState(
        makeParams({ onUpdateListAddItemPosition }),
      );

      handleToggleAddItemPosition("first");

      expect(onUpdateListAddItemPosition).toHaveBeenCalledTimes(1);
    });
  });

  describe("返り値の形状", () => {
    it("hasCompletedItems・handleUpdateAllItemsBgColor・handleToggleAddItemPosition を持つ", () => {
      const state = createToolbarState(makeParams());

      expect(state).toHaveProperty("hasCompletedItems");
      expect(state).toHaveProperty("handleUpdateAllItemsBgColor");
      expect(state).toHaveProperty("handleToggleAddItemPosition");
    });

    it("handleUpdateAllItemsBgColor と handleToggleAddItemPosition は関数", () => {
      const state = createToolbarState(makeParams());

      expect(typeof state.handleUpdateAllItemsBgColor).toBe("function");
      expect(typeof state.handleToggleAddItemPosition).toBe("function");
    });

    it("list.id が変わると各ハンドラーは新しい list.id を参照する", () => {
      const onUpdateAllItemsBgColor = jest.fn();
      const onUpdateListAddItemPosition = jest.fn();
      const list = makeList({ id: "list-xyz" });

      const { handleUpdateAllItemsBgColor, handleToggleAddItemPosition } =
        createToolbarState({
          list,
          onUpdateAllItemsBgColor,
          onUpdateListAddItemPosition,
        });

      handleUpdateAllItemsBgColor("bg-green-50");
      handleToggleAddItemPosition("last");

      expect(onUpdateAllItemsBgColor).toHaveBeenCalledWith(
        "list-xyz",
        "bg-green-50",
      );
      expect(onUpdateListAddItemPosition).toHaveBeenCalledWith(
        "list-xyz",
        "last",
      );
    });
  });
});
