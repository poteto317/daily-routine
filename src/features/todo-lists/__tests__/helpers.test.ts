import {
  addItemToList,
  deleteItemFromList,
  indentItemInList,
  outdentItemInList,
  reorderItemsInList,
  toggleItemInList,
  updateListAddItemPosition,
  updateListHideCompleted,
} from "../helpers";
import { getItemIndentLevel } from "../todoListItemIndentLevel";
import type { TodoList, TodoListItem } from "../types";

jest.mock("../todoListItemIndentLevel", () => ({
  ...jest.requireActual("../todoListItemIndentLevel"),
  getItemIndentLevel: jest.fn(),
}));

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todo list helpers", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
    jest.spyOn(Date, "now").mockReturnValue(12345);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    const real = jest.requireActual<
      typeof import("../todoListItemIndentLevel")
    >("../todoListItemIndentLevel");
    (getItemIndentLevel as jest.Mock).mockImplementation(
      real.getItemIndentLevel,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("指定リストにアイテムを追加する", () => {
    const item = createItem();
    const result = addItemToList([createList()], "list-1", item);

    expect(result[0].items).toEqual([item]);
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("insertAfterIndex を指定すると指定位置の直後に挿入される", () => {
    const itemA = createItem({ id: "a", title: "A" });
    const itemB = createItem({ id: "b", title: "B" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA, itemB] });

    const result = addItemToList([list], "list-1", newItem, 0);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new", "b"]);
  });

  it("insertAfterIndex が範囲外の場合は末尾に追加される", () => {
    const itemA = createItem({ id: "a" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA] });

    const result = addItemToList([list], "list-1", newItem, 99);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new"]);
  });

  it("insertAfterIndex が負の値の場合は末尾に追加される", () => {
    const itemA = createItem({ id: "a" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA] });

    const result = addItemToList([list], "list-1", newItem, -1);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new"]);
  });

  it("addItemPosition が 'first' のとき insertAfterIndex なしで先頭に追加される", () => {
    const itemA = createItem({ id: "a" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA], addItemPosition: "first" });

    const result = addItemToList([list], "list-1", newItem);

    expect(result[0].items.map((i) => i.id)).toEqual(["new", "a"]);
  });

  it("addItemPosition が 'first' でも insertAfterIndex が有効なら指定位置に挿入される", () => {
    const itemA = createItem({ id: "a" });
    const itemB = createItem({ id: "b" });
    const newItem = createItem({ id: "new" });
    const list = createList({ items: [itemA, itemB], addItemPosition: "first" });

    const result = addItemToList([list], "list-1", newItem, 0);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new", "b"]);
  });

  it("updateListAddItemPosition でリストの addItemPosition を更新する", () => {
    const list = createList();

    const result = updateListAddItemPosition([list], "list-1", "first");

    expect(result[0].addItemPosition).toBe("first");
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("updateListAddItemPosition は対象外のリストを変更しない", () => {
    const list1 = createList({ id: "list-1" });
    const list2 = createList({ id: "list-2", addItemPosition: "first" });

    const result = updateListAddItemPosition([list1, list2], "list-1", "last");

    expect(result[0].addItemPosition).toBe("last");
    expect(result[1].addItemPosition).toBe("first");
  });

  it("updateListHideCompleted でリストの hideCompleted を更新する", () => {
    const list = createList();

    const result = updateListHideCompleted([list], "list-1", true);

    expect(result[0].hideCompleted).toBe(true);
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("updateListHideCompleted は対象外のリストを変更しない", () => {
    const list1 = createList({ id: "list-1" });
    const list2 = createList({ id: "list-2", hideCompleted: true });

    const result = updateListHideCompleted([list1, list2], "list-1", true);

    expect(result[0].hideCompleted).toBe(true);
    expect(result[1]).toBe(list2);
  });

  it("指定アイテムの完了状態を切り替える", () => {
    const result = toggleItemInList(
      [createList({ items: [createItem()] })],
      "list-1",
      "item-1",
    );

    expect(result[0].items[0].isCompleted).toBe(true);
  });

  it("指定アイテムを削除する", () => {
    const result = deleteItemFromList(
      [createList({ items: [createItem(), createItem({ id: "item-2" })] })],
      "list-1",
      "item-1",
    );

    expect(result[0].items).toEqual([
      expect.objectContaining({ id: "item-2" }),
    ]);
  });

  it("インデントを上げ下げする", () => {
    const items = [createItem({ indent: 1 })];

    expect(
      indentItemInList([createList({ items })], "list-1", "item-1")[0].items[0]
        .indent,
    ).toBe(2);
    expect(
      outdentItemInList([createList({ items })], "list-1", "item-1")[0].items[0]
        .indent,
    ).toBe(0);
  });

  it("インデントは 0-3 の範囲に収まる", () => {
    const items = [createItem({ indent: 3 })];

    expect(
      indentItemInList([createList({ items })], "list-1", "item-1")[0].items[0]
        .indent,
    ).toBe(3);
    expect(
      outdentItemInList(
        [createList({ items: [createItem({ indent: 0 })] })],
        "list-1",
        "item-1",
      )[0].items[0].indent,
    ).toBe(0);
  });

  it("親アイテムの並び替え時は子要素も一緒に移動する", () => {
    const items = [
      createItem({ id: "item-1", title: "Parent" }),
      createItem({ id: "item-2", title: "Child", indent: 1 }),
      createItem({ id: "item-3", title: "Sibling" }),
      createItem({ id: "item-4", title: "Later" }),
    ];

    const result = reorderItemsInList([createList({ items })], "list-1", 0, 3);

    expect(result[0].items.map((item) => item.id)).toEqual([
      "item-3",
      "item-4",
      "item-1",
      "item-2",
    ]);
  });

  it("子アイテムを並び替えるとその子孫も一緒に移動する", () => {
    const items = [
      createItem({ id: "item-1", title: "Root" }),
      createItem({ id: "item-2", title: "Child", indent: 1 }),
      createItem({ id: "item-3", title: "Grandchild", indent: 2 }),
      createItem({ id: "item-4", title: "Sibling child", indent: 1 }),
      createItem({ id: "item-5", title: "Another root" }),
    ];

    const result = reorderItemsInList([createList({ items })], "list-1", 1, 4);

    expect(result[0].items.map((item) => item.id)).toEqual([
      "item-1",
      "item-4",
      "item-5",
      "item-2",
      "item-3",
    ]);
  });

  describe("移動先アンカーに子孫がいる場合の並び替え（データ破損の防止）", () => {
    it("前方移動: 移動先アンカーの子孫が移動ブロックとの間に取り残されず、移動先ブロック全体の直後に挿入される", () => {
      const items = [
        createItem({ id: "A", title: "A" }),
        createItem({ id: "C", title: "C", indent: 1 }), // Aの子
        createItem({ id: "B", title: "B" }),
        createItem({ id: "D", title: "D", indent: 1 }), // Bの子
      ];

      const result = reorderItemsInList(
        [createList({ items })],
        "list-1",
        0,
        2,
      );

      expect(result[0].items.map((i) => i.id)).toEqual(["B", "D", "A", "C"]);
    });

    it("後方移動: 移動先アンカーに子孫がいても正しく移動先ブロックの直前に挿入される", () => {
      const items = [
        createItem({ id: "A", title: "A" }),
        createItem({ id: "C", title: "C", indent: 1 }), // Aの子
        createItem({ id: "B", title: "B" }),
        createItem({ id: "D", title: "D", indent: 1 }), // Bの子
      ];

      const result = reorderItemsInList(
        [createList({ items })],
        "list-1",
        2,
        0,
      );

      expect(result[0].items.map((i) => i.id)).toEqual(["B", "D", "A", "C"]);
    });

    it("移動先アンカーに複数の子孫（孫を含む）がいても全員まとめて維持される", () => {
      const items = [
        createItem({ id: "A", title: "A" }),
        createItem({ id: "B", title: "B" }),
        createItem({ id: "B-child", title: "B-child", indent: 1 }),
        createItem({ id: "B-grandchild", title: "B-grandchild", indent: 2 }),
        createItem({ id: "E", title: "E" }),
      ];

      // A（子孫なし）を B（子・孫あり）へ前方移動
      const result = reorderItemsInList(
        [createList({ items })],
        "list-1",
        0,
        1,
      );

      expect(result[0].items.map((i) => i.id)).toEqual([
        "B",
        "B-child",
        "B-grandchild",
        "A",
        "E",
      ]);
    });
  });

  describe("表示順とデータ順が乖離する場合の並び替え（reorderItemsInList の純粋関数としての挙動）", () => {
    /**
     * dnd-kit の handleDragEnd と同じ方式（表示中のアイテムIDを生配列上で
     * findIndex する）でドラッグ操作をシミュレートするヘルパー。
     *
     * 注意: 表示順は常に固定ソート（未完了→完了、カテゴリ別）されるため、
     * useTodoListInteractionMode.ts で DnD は常時無効化されており、
     * これらのシナリオはドラッグ操作としては現状発生しない。
     * reorderItemsInList 自体は将来の再設計余地のため温存されているので、
     * その純粋関数としての不変条件（ブロック移動・データ非破損）を検証する。
     */
    const simulateDrag = (
      list: TodoList,
      activeId: string,
      overId: string,
    ): TodoList => {
      const fromIndex = list.items.findIndex((item) => item.id === activeId);
      const toIndex = list.items.findIndex((item) => item.id === overId);
      return reorderItemsInList([list], "list-1", fromIndex, toIndex)[0];
    };

    it("完了状態の異なる親子ブロックは、同一完了状態同士のドラッグでも並び替えで再構造化されうる（既知の制約。DnDを常時無効化している理由の一つ）", () => {
      const items = [
        createItem({ id: "parent", title: "Parent" }),
        createItem({
          id: "child",
          title: "Child",
          indent: 1,
          isCompleted: true,
        }),
        createItem({ id: "other", title: "Other" }),
        createItem({ id: "item2", title: "Item2", isCompleted: true }),
      ];
      const list = createList({ items });
      // 表示順（完了を下へ）: [Parent, Other, Child, Item2]
      // item2（完了）を child（完了、同一完了状態）の前へドラッグしても、
      // 生配列上では child と parent の間に item2 が挿入され、
      // child は parent ではなく item2 の子として誤検出される
      const updated = simulateDrag(list, "item2", "child");

      expect(updated.items.map((i) => i.id)).toEqual([
        "parent",
        "item2",
        "child",
        "other",
      ]);
      // child (indent=1) は parent ではなく item2 に隣接してしまっている
      expect(updated.items[1].id).toBe("item2");
      expect(updated.items[2].id).toBe("child");
    });

    it("hideCompleted 表示中に非表示アイテムを巻き込まずに並び替えても非表示アイテムは失われない（生配列上の並び位置自体は変わりうる）", () => {
      const items = [
        createItem({ id: "a", title: "A" }),
        createItem({ id: "b", title: "B", isCompleted: true }),
        createItem({ id: "c", title: "C" }),
      ];
      const list = createList({ items });
      // hideCompleted 表示では b は非表示。ドラッグ操作の対象は a と c のみだが、
      // 生配列全体に対するインデックスベースの並び替えのため、
      // 非表示だった b の生配列上の位置自体はずれる（インデックス1→0）。
      // ここで保証したいのは「消失・重複しない」ことであり、位置の不変ではない。
      const updated = simulateDrag(list, "a", "c");

      expect(updated.items.map((i) => i.id)).toEqual(["b", "c", "a"]);
      // 非表示だった b が失われず、重複もなく、ちょうど1件存在する
      expect(updated.items).toHaveLength(3);
      expect(updated.items.filter((i) => i.id === "b")).toHaveLength(1);
    });

    it("未完了アイテムを完了グループの境界付近にドロップしてもデータが破損しない", () => {
      const items = [
        createItem({ id: "a", title: "A" }),
        createItem({ id: "b", title: "B", isCompleted: true }),
        createItem({ id: "c", title: "C" }),
        createItem({ id: "d", title: "D", isCompleted: true }),
      ];
      const list = createList({ items });
      // A（未完了）を D（完了、末尾）の位置へドラッグ
      const updated = simulateDrag(list, "a", "d");

      // 件数・IDの集合が保たれている（消失・重複がない）
      expect(updated.items).toHaveLength(4);
      expect(new Set(updated.items.map((i) => i.id))).toEqual(
        new Set(["a", "b", "c", "d"]),
      );
    });

    it("完了アイテムが混在していても親子ブロックはまとめて移動する", () => {
      const items = [
        createItem({ id: "parent", title: "Parent" }),
        createItem({ id: "child", title: "Child", indent: 1 }),
        createItem({ id: "done", title: "Done", isCompleted: true }),
        createItem({ id: "other", title: "Other" }),
      ];
      const list = createList({ items });
      // parent（子 child 持ち）を other の後ろへドラッグ
      const updated = simulateDrag(list, "parent", "other");

      expect(updated.items.map((i) => i.id)).toEqual([
        "done",
        "other",
        "parent",
        "child",
      ]);
    });
  });

  it("indentItemInList は getItemIndentLevel に委譲してインデントを読み取る", () => {
    (getItemIndentLevel as jest.Mock).mockReturnValue(1);

    const items = [createItem({ indent: 1 })];
    indentItemInList([createList({ items })], "list-1", "item-1");

    expect(getItemIndentLevel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item-1" }),
    );
  });

  it("outdentItemInList は getItemIndentLevel に委譲してインデントを読み取る", () => {
    (getItemIndentLevel as jest.Mock).mockReturnValue(2);

    const items = [createItem({ indent: 2 })];
    outdentItemInList([createList({ items })], "list-1", "item-1");

    expect(getItemIndentLevel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item-1" }),
    );
  });

  it("reorderItemsInList は getItemIndentLevel に委譲してブロック境界を判定する", () => {
    const items = [
      createItem({ id: "item-1", indent: 0 }),
      createItem({ id: "item-2", indent: 1 }),
      createItem({ id: "item-3", indent: 0 }),
    ];
    const list = createList({ items });

    reorderItemsInList([list], "list-1", 0, 2);

    expect(getItemIndentLevel).toHaveBeenCalled();
  });
});
