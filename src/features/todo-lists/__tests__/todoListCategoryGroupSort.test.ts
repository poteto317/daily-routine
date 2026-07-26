import { groupItemsByCategory } from "../todoListCategoryGroupSort";
import { buildTodoCategoryLookup } from "../todoCategoryLookup";
import type { TodoCategory, TodoListItem } from "../types";

const item = (
  id: string,
  overrides: Partial<TodoListItem> = {},
): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const categories: TodoCategory[] = [
  { id: "cat-work", name: "仕事", createdAt: "2026-01-01T00:00:00.000Z" },
  {
    id: "cat-private",
    name: "プライベート",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("groupItemsByCategory", () => {
  const lookup = buildTodoCategoryLookup(categories);

  it("アイテムがない場合は空配列を返す", () => {
    expect(groupItemsByCategory([], lookup)).toEqual([]);
  });

  it("カテゴリごとにグルーピングし、categoryLookupのキー順（=categories配列の順）でグループが並ぶ", () => {
    const items = [
      item("a", { categoryId: "cat-private" }),
      item("b", { categoryId: "cat-work" }),
      item("c", { categoryId: "cat-private" }),
      item("d", { categoryId: "cat-work" }),
    ];

    const result = groupItemsByCategory(items, lookup);

    // アイテム側での出現順（cat-privateが先）ではなく、categories配列で
    // cat-workがcat-privateより先にあるため、そちらのグループが先になる。
    expect(result.map((i) => i.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("アイテムに登場しないカテゴリのバケットは結果に現れない（順序決定に空バケットを混ぜない）", () => {
    const categoriesWithExtra: TodoCategory[] = [
      { id: "cat-work", name: "仕事", createdAt: "2026-01-01T00:00:00.000Z" },
      {
        id: "cat-unused",
        name: "使われていないカテゴリ",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "cat-private",
        name: "プライベート",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const lookupWithExtra = buildTodoCategoryLookup(categoriesWithExtra);
    const items = [
      item("a", { categoryId: "cat-private" }),
      item("b", { categoryId: "cat-work" }),
    ];

    const result = groupItemsByCategory(items, lookupWithExtra);

    expect(result.map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("categoryId未設定のアイテムは未分類グループとして最後に配置される", () => {
    const items = [
      item("uncategorized-1"),
      item("work-1", { categoryId: "cat-work" }),
      item("uncategorized-2"),
    ];

    const result = groupItemsByCategory(items, lookup);

    expect(result.map((i) => i.id)).toEqual([
      "work-1",
      "uncategorized-1",
      "uncategorized-2",
    ]);
  });

  it("参照先が削除済み（lookupに存在しない）categoryIdのアイテムも未分類扱いになる", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-deleted" }),
    ];

    const result = groupItemsByCategory(items, lookup);

    expect(result.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("各グループ内でアイテムの相対順序が保持される（安定ソート）", () => {
    const items = [
      item("work-1", { categoryId: "cat-work" }),
      item("private-1", { categoryId: "cat-private" }),
      item("work-2", { categoryId: "cat-work" }),
      item("work-3", { categoryId: "cat-work" }),
    ];

    const result = groupItemsByCategory(items, lookup);
    const workIds = result
      .filter((i) => i.categoryId === "cat-work")
      .map((i) => i.id);

    expect(workIds).toEqual(["work-1", "work-2", "work-3"]);
  });

  it("完了状態に関わらずグループ内の元の順序を保つ（完了アイテムの移動は別関数の責務）", () => {
    const items = [
      item("work-done", { categoryId: "cat-work", isCompleted: true }),
      item("work-open", { categoryId: "cat-work" }),
    ];

    const result = groupItemsByCategory(items, lookup);

    expect(result.map((i) => i.id)).toEqual(["work-done", "work-open"]);
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-private" }),
    ];
    const copy = [...items];
    groupItemsByCategory(items, lookup);
    expect(items.map((i) => i.id)).toEqual(copy.map((i) => i.id));
  });
});
