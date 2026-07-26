import { groupItemsByCategoryWithCompletedAtEnd } from "../todoListCategoryGroupWithCompletedAtEndSort";
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

describe("groupItemsByCategoryWithCompletedAtEnd", () => {
  const lookup = buildTodoCategoryLookup(categories);

  it("アイテムがない場合は空配列を返す", () => {
    expect(groupItemsByCategoryWithCompletedAtEnd([], lookup)).toEqual([]);
  });

  it("完了アイテムは各グループ内に留まらず、リスト全体の末尾セクションにまとまる", () => {
    const items = [
      item("work-done", { categoryId: "cat-work", isCompleted: true }),
      item("work-open", { categoryId: "cat-work" }),
      item("private-open", { categoryId: "cat-private" }),
      item("private-done", {
        categoryId: "cat-private",
        isCompleted: true,
      }),
    ];

    const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

    // 未完了セクション(work-open, private-open)の後に完了セクション(work-done, private-done)が続く
    expect(result.map((i) => i.id)).toEqual([
      "work-open",
      "private-open",
      "work-done",
      "private-done",
    ]);
  });

  it("完了セクション内もカテゴリ別にグルーピングされる", () => {
    const items = [
      item("work-done-1", { categoryId: "cat-work", isCompleted: true }),
      item("private-done-1", {
        categoryId: "cat-private",
        isCompleted: true,
      }),
      item("work-done-2", { categoryId: "cat-work", isCompleted: true }),
      item("private-done-2", {
        categoryId: "cat-private",
        isCompleted: true,
      }),
    ];

    const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

    // cat-workが先に出現するのでそのグループが先、各グループ内の相対順序も保持
    expect(result.map((i) => i.id)).toEqual([
      "work-done-1",
      "work-done-2",
      "private-done-1",
      "private-done-2",
    ]);
  });

  it("カテゴリのグループ順は全セクションで一貫しており、セクション内の初出順には左右されない", () => {
    const items = [
      // 未完了セクションではcat-workが先に出現する
      item("work-open", { categoryId: "cat-work" }),
      item("private-open", { categoryId: "cat-private" }),
      // 完了セクションではcat-privateが先に出現するが、グループ順は
      // categories配列の順（cat-work→cat-private）に従うため変わらない。
      item("private-done", {
        categoryId: "cat-private",
        isCompleted: true,
      }),
      item("work-done", { categoryId: "cat-work", isCompleted: true }),
    ];

    const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

    expect(result.map((i) => i.id)).toEqual([
      "work-open",
      "private-open",
      "work-done",
      "private-done",
    ]);
  });

  it("未分類（categoryId未設定・削除済みカテゴリ参照）アイテムは各セクション内で最後に配置される", () => {
    const items = [
      item("uncategorized-open"),
      item("work-open", { categoryId: "cat-work" }),
      item("uncategorized-done", { isCompleted: true }),
      item("work-done", { categoryId: "cat-work", isCompleted: true }),
      item("deleted-cat-open", { categoryId: "cat-deleted" }),
      item("deleted-cat-done", {
        categoryId: "cat-deleted",
        isCompleted: true,
      }),
    ];

    const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

    expect(result.map((i) => i.id)).toEqual([
      "work-open",
      "uncategorized-open",
      "deleted-cat-open",
      "work-done",
      "uncategorized-done",
      "deleted-cat-done",
    ]);
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const items = [
      item("a", { categoryId: "cat-work" }),
      item("b", { categoryId: "cat-private", isCompleted: true }),
    ];
    const copy = [...items];
    groupItemsByCategoryWithCompletedAtEnd(items, lookup);
    expect(items.map((i) => i.id)).toEqual(copy.map((i) => i.id));
  });

  describe("親子ブロック（インデント）の隣接関係", () => {
    it("親が未完了・子が完了の場合、子は完了セクションへ移動せず親の直後に留まる", () => {
      const items = [
        item("parent", { categoryId: "cat-work", indent: 0 }),
        item("child", {
          categoryId: "cat-work",
          indent: 1,
          isCompleted: true,
        }),
        item("private-open", { categoryId: "cat-private" }),
      ];

      const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

      // childが完了セクションへ単独で移動し、無関係なprivate-openの子に
      // 見えてしまうことを防ぐ。parentとchildは常に隣接したまま。
      expect(result.map((i) => i.id)).toEqual([
        "parent",
        "child",
        "private-open",
      ]);
    });

    it("親が完了・子が未完了の場合、ブロック全体が親の完了状態に従って完了セクションへ移動する", () => {
      const items = [
        item("parent", {
          categoryId: "cat-work",
          indent: 0,
          isCompleted: true,
        }),
        item("child", { categoryId: "cat-work", indent: 1 }),
        item("private-open", { categoryId: "cat-private" }),
      ];

      const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

      expect(result.map((i) => i.id)).toEqual([
        "private-open",
        "parent",
        "child",
      ]);
    });

    it("孫を含むブロックも1つの単位として扱われる", () => {
      const items = [
        item("parent", { categoryId: "cat-work", indent: 0 }),
        item("child", {
          categoryId: "cat-work",
          indent: 1,
          isCompleted: true,
        }),
        item("grandchild", {
          categoryId: "cat-work",
          indent: 2,
        }),
      ];

      const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

      // parent(未完了)が基準のためブロック全体が未完了セクションに残る
      expect(result.map((i) => i.id)).toEqual([
        "parent",
        "child",
        "grandchild",
      ]);
    });

    it("複数の親子ブロックが完了状態・カテゴリごとに正しくグルーピングされる", () => {
      const items = [
        item("work-parent-open", { categoryId: "cat-work", indent: 0 }),
        item("work-child-done", {
          categoryId: "cat-work",
          indent: 1,
          isCompleted: true,
        }),
        item("private-parent-done", {
          categoryId: "cat-private",
          indent: 0,
          isCompleted: true,
        }),
        item("private-child-open", { categoryId: "cat-private", indent: 1 }),
      ];

      const result = groupItemsByCategoryWithCompletedAtEnd(items, lookup);

      expect(result.map((i) => i.id)).toEqual([
        // 未完了セクション: work-parent-open のブロックのみ
        "work-parent-open",
        "work-child-done",
        // 完了セクション: private-parent-done のブロックのみ
        "private-parent-done",
        "private-child-open",
      ]);
    });
  });
});
