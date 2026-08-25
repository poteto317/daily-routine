import { sampleTodoLists } from "../__fixtures__/todoListFixtures";

const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("sampleTodoLists / 構造検証", () => {
  it("各リストが id/title/items/createdAt/updatedAt を持つ", () => {
    sampleTodoLists.forEach((list) => {
      expect(typeof list.id).toBe("string");
      expect(list.id.length).toBeGreaterThan(0);
      expect(typeof list.title).toBe("string");
      expect(list.title.length).toBeGreaterThan(0);
      expect(Array.isArray(list.items)).toBe(true);
      expect(typeof list.createdAt).toBe("string");
      expect(typeof list.updatedAt).toBe("string");
    });
  });

  it("リストの id が全件で一意である", () => {
    const ids = sampleTodoLists.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("createdAt / updatedAt が ISO 8601 形式である", () => {
    sampleTodoLists.forEach((list) => {
      expect(list.createdAt).toMatch(ISO_DATETIME_PATTERN);
      expect(list.updatedAt).toMatch(ISO_DATETIME_PATTERN);
    });
  });

  it("updatedAt が createdAt 以降である", () => {
    sampleTodoLists.forEach((list) => {
      expect(new Date(list.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(list.createdAt).getTime(),
      );
    });
  });

  it("各アイテムが id/title/isCompleted/createdAt を持つ", () => {
    sampleTodoLists.forEach((list) => {
      list.items.forEach((item) => {
        expect(typeof item.id).toBe("string");
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.title).toBe("string");
        expect(item.title.length).toBeGreaterThan(0);
        expect(typeof item.isCompleted).toBe("boolean");
        expect(typeof item.createdAt).toBe("string");
      });
    });
  });

  it("アイテムの id がリスト全体で一意である（グローバル）", () => {
    const allItemIds = sampleTodoLists.flatMap((l) => l.items.map((i) => i.id));
    expect(new Set(allItemIds).size).toBe(allItemIds.length);
  });

  it("各リスト内のアイテム id がリスト単位で一意である", () => {
    sampleTodoLists.forEach((list) => {
      const ids = list.items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it("アイテムの createdAt が ISO 8601 形式である", () => {
    sampleTodoLists.forEach((list) => {
      list.items.forEach((item) => {
        expect(item.createdAt).toMatch(ISO_DATETIME_PATTERN);
      });
    });
  });
});

describe("sampleTodoLists / ドメイン制約", () => {
  it("2件のリストを含む", () => {
    expect(sampleTodoLists).toHaveLength(2);
  });

  it("少なくとも1件のリストにアイテムが存在する", () => {
    const totalItems = sampleTodoLists.reduce(
      (sum, l) => sum + l.items.length,
      0,
    );
    expect(totalItems).toBeGreaterThan(0);
  });

  it("完了・未完了が混在するアイテムが存在する", () => {
    const allItems = sampleTodoLists.flatMap((l) => l.items);
    const completedCount = allItems.filter((i) => i.isCompleted).length;
    const incompleteCount = allItems.filter((i) => !i.isCompleted).length;
    expect(completedCount).toBeGreaterThan(0);
    expect(incompleteCount).toBeGreaterThan(0);
  });
});
