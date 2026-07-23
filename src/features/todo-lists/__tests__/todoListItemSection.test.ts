import { isSameTodoItemSection } from "../todoListItemSection";
import { buildTodoCategoryLookup } from "../todoCategoryLookup";
import { item, sectionTestCategories } from "./todoListItemSection.test-utils";

describe("isSameTodoItemSection", () => {
  const lookup = buildTodoCategoryLookup(sectionTestCategories);

  it("完了状態・カテゴリが共に同じ場合はtrueを返す", () => {
    const a = item("a", { categoryId: "cat-work", isCompleted: false });
    const b = item("b", { categoryId: "cat-work", isCompleted: false });

    expect(isSameTodoItemSection(a, b, lookup)).toBe(true);
  });

  it("完了状態が異なる場合はfalseを返す（カテゴリが同じでも）", () => {
    const a = item("a", { categoryId: "cat-work", isCompleted: false });
    const b = item("b", { categoryId: "cat-work", isCompleted: true });

    expect(isSameTodoItemSection(a, b, lookup)).toBe(false);
  });

  it("カテゴリが異なる場合はfalseを返す（完了状態が同じでも）", () => {
    const a = item("a", { categoryId: "cat-work", isCompleted: false });
    const b = item("b", { categoryId: "cat-private", isCompleted: false });

    expect(isSameTodoItemSection(a, b, lookup)).toBe(false);
  });

  it("両方とも未分類（categoryId未設定）の場合はtrueを返す", () => {
    const a = item("a", { isCompleted: true });
    const b = item("b", { isCompleted: true });

    expect(isSameTodoItemSection(a, b, lookup)).toBe(true);
  });

  it("片方が未分類・もう片方がカテゴリ設定済みの場合はfalseを返す", () => {
    const a = item("a", { isCompleted: false });
    const b = item("b", { categoryId: "cat-work", isCompleted: false });

    expect(isSameTodoItemSection(a, b, lookup)).toBe(false);
  });

  it("削除済みカテゴリを参照するアイテム同士は未分類扱いでtrueを返す", () => {
    const a = item("a", { categoryId: "cat-deleted", isCompleted: false });
    const b = item("b", { isCompleted: false });

    expect(isSameTodoItemSection(a, b, lookup)).toBe(true);
  });

  it("同一アイテム同士（完全一致）はtrueを返す", () => {
    const a = item("a", { categoryId: "cat-work", isCompleted: true });

    expect(isSameTodoItemSection(a, a, lookup)).toBe(true);
  });
});
