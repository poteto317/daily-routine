import {
  buildTodoCategoryLookup,
  resolveTodoItemCategory,
  resolveTodoItemDisplayBgColor,
} from "../todoCategoryLookup";
import type { TodoCategory } from "../types";

const categories: TodoCategory[] = [
  {
    id: "cat-1",
    name: "仕事",
    color: "bg-blue-50",
    createdAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "プライベート",
    createdAt: "2026-05-01T00:00:00.000Z",
  },
];

describe("buildTodoCategoryLookup", () => {
  it("id毎にO(1)で引けるMapを作る", () => {
    const lookup = buildTodoCategoryLookup(categories);

    expect(lookup.get("cat-1")).toEqual(categories[0]);
    expect(lookup.get("cat-2")).toEqual(categories[1]);
    expect(lookup.size).toBe(2);
  });
});

describe("resolveTodoItemCategory", () => {
  const lookup = buildTodoCategoryLookup(categories);

  it("categoryIdが割り当てられ参照先が存在する場合はそのカテゴリを返す", () => {
    expect(resolveTodoItemCategory(lookup, { categoryId: "cat-1" })).toEqual(
      categories[0],
    );
  });

  it("categoryIdが未設定の場合はundefinedを返す", () => {
    expect(
      resolveTodoItemCategory(lookup, { categoryId: undefined }),
    ).toBeUndefined();
  });

  it("categoryIdの参照先が存在しない（削除済み）場合はundefinedを返す", () => {
    expect(
      resolveTodoItemCategory(lookup, { categoryId: "cat-404" }),
    ).toBeUndefined();
  });
});

describe("resolveTodoItemDisplayBgColor", () => {
  const lookup = buildTodoCategoryLookup(categories);

  it("カテゴリに色が設定されている場合はカテゴリの色を返す（アイテム自身のbgColorより優先）", () => {
    expect(
      resolveTodoItemDisplayBgColor(lookup, {
        categoryId: "cat-1",
        bgColor: "bg-red-50",
      }),
    ).toBe("bg-blue-50");
  });

  it("カテゴリは存在するが色が未設定の場合はアイテム自身のbgColorにフォールバックする", () => {
    expect(
      resolveTodoItemDisplayBgColor(lookup, {
        categoryId: "cat-2",
        bgColor: "bg-red-50",
      }),
    ).toBe("bg-red-50");
  });

  it("categoryIdが未設定の場合はアイテム自身のbgColorにフォールバックする", () => {
    expect(
      resolveTodoItemDisplayBgColor(lookup, {
        categoryId: undefined,
        bgColor: "bg-red-50",
      }),
    ).toBe("bg-red-50");
  });

  it("カテゴリが削除済み（参照先なし）の場合はアイテム自身のbgColorにフォールバックする（回帰テスト）", () => {
    expect(
      resolveTodoItemDisplayBgColor(lookup, {
        categoryId: "cat-404",
        bgColor: "bg-red-50",
      }),
    ).toBe("bg-red-50");
  });

  it("カテゴリ・アイテム色のいずれも無い場合はundefined（デフォルト）を返す", () => {
    expect(
      resolveTodoItemDisplayBgColor(lookup, {
        categoryId: undefined,
        bgColor: undefined,
      }),
    ).toBeUndefined();
  });
});
