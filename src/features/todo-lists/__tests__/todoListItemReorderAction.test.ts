import { reorderTodoItemsIfSameSection } from "../todoListItemReorderAction";
import { buildTodoCategoryLookup } from "../todoCategoryLookup";
import { item, sectionTestCategories } from "./todoListItemSection.test-utils";

describe("reorderTodoItemsIfSameSection", () => {
  const categoryLookup = buildTodoCategoryLookup(sectionTestCategories);

  it("完了状態・カテゴリが共に同じ場合は onReorderItems を正しい引数で呼ぶ", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-work" }),
    ];
    const onReorderItems = jest.fn();

    reorderTodoItemsIfSameSection({
      items,
      categoryLookup,
      listId: "list-1",
      fromIndex: 0,
      toIndex: 1,
      onReorderItems,
    });

    expect(onReorderItems).toHaveBeenCalledWith("list-1", 0, 1);
  });

  it("カテゴリが異なる場合は onReorderItems を呼ばない", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-private" }),
    ];
    const onReorderItems = jest.fn();

    reorderTodoItemsIfSameSection({
      items,
      categoryLookup,
      listId: "list-1",
      fromIndex: 0,
      toIndex: 1,
      onReorderItems,
    });

    expect(onReorderItems).not.toHaveBeenCalled();
  });

  it("完了状態が異なる場合は onReorderItems を呼ばない", () => {
    const items = [
      item("a", { isCompleted: false }),
      item("b", { isCompleted: true }),
    ];
    const onReorderItems = jest.fn();

    reorderTodoItemsIfSameSection({
      items,
      categoryLookup,
      listId: "list-1",
      fromIndex: 0,
      toIndex: 1,
      onReorderItems,
    });

    expect(onReorderItems).not.toHaveBeenCalled();
  });

  it("呼び出し元の listId がそのまま onReorderItems へ伝播される", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-work" }),
    ];
    const onReorderItems = jest.fn();

    reorderTodoItemsIfSameSection({
      items,
      categoryLookup,
      listId: "list-42",
      fromIndex: 0,
      toIndex: 1,
      onReorderItems,
    });

    expect(onReorderItems).toHaveBeenCalledWith("list-42", 0, 1);
  });

  describe("ブロックアンカー以外の起点・着地点の拒否", () => {
    // items: A(anchor, work, indent0), C(Aの子, private, indent1), B(anchor, work, indent0)
    // ブロック分割は [A, C] と [B] の2ブロック。アンカーのインデックスは 0 と 2 のみ。
    const itemsWithChild = [
      item("A", { categoryId: "cat-work", indent: 0 }),
      item("C", { categoryId: "cat-private", indent: 1 }),
      item("B", { categoryId: "cat-work", indent: 0 }),
    ];

    it("起点・着地点が共にアンカー（親アイテム）同士なら onReorderItems を呼ぶ", () => {
      const onReorderItems = jest.fn();

      reorderTodoItemsIfSameSection({
        items: itemsWithChild,
        categoryLookup,
        listId: "list-1",
        fromIndex: 0,
        toIndex: 2,
        onReorderItems,
      });

      expect(onReorderItems).toHaveBeenCalledWith("list-1", 0, 2);
    });

    it("起点が子アイテム（ブロックのアンカーでない）の場合は onReorderItems を呼ばない", () => {
      const onReorderItems = jest.fn();

      reorderTodoItemsIfSameSection({
        items: itemsWithChild,
        categoryLookup,
        listId: "list-1",
        fromIndex: 1, // C（Aの子、アンカーではない）
        toIndex: 2, // B（アンカー）
        onReorderItems,
      });

      expect(onReorderItems).not.toHaveBeenCalled();
    });

    it("着地点が子アイテム（ブロックのアンカーでない）の場合は onReorderItems を呼ばない", () => {
      const onReorderItems = jest.fn();

      reorderTodoItemsIfSameSection({
        items: itemsWithChild,
        categoryLookup,
        listId: "list-1",
        fromIndex: 2, // B（アンカー）
        toIndex: 1, // C（Aの子、アンカーではない）
        onReorderItems,
      });

      expect(onReorderItems).not.toHaveBeenCalled();
    });
  });

  describe("範囲外インデックスのガード", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-work" }),
    ];

    it("fromIndex が負の場合は例外を投げずに onReorderItems を呼ばない", () => {
      const onReorderItems = jest.fn();

      expect(() =>
        reorderTodoItemsIfSameSection({
          items,
          categoryLookup,
          listId: "list-1",
          fromIndex: -1,
          toIndex: 0,
          onReorderItems,
        }),
      ).not.toThrow();

      expect(onReorderItems).not.toHaveBeenCalled();
    });

    it("toIndex が items.length 以上の場合は例外を投げずに onReorderItems を呼ばない", () => {
      const onReorderItems = jest.fn();

      expect(() =>
        reorderTodoItemsIfSameSection({
          items,
          categoryLookup,
          listId: "list-1",
          fromIndex: 0,
          toIndex: items.length,
          onReorderItems,
        }),
      ).not.toThrow();

      expect(onReorderItems).not.toHaveBeenCalled();
    });

    it("fromIndex と toIndex が同じ場合は onReorderItems を呼ばない", () => {
      const onReorderItems = jest.fn();

      reorderTodoItemsIfSameSection({
        items,
        categoryLookup,
        listId: "list-1",
        fromIndex: 0,
        toIndex: 0,
        onReorderItems,
      });

      expect(onReorderItems).not.toHaveBeenCalled();
    });
  });
});
