/** @jest-environment node */
import {
  applyItemPatch,
  createTodoItem,
} from "../../operations/todo/todoItemEntity";
import type { TodoItem, TodoList } from "../../operations/todo/todoTypes";

const NOW = new Date("2026-10-05T00:00:00.000Z");
const ISO = NOW.toISOString();

const baseList: TodoList = {
  id: "l1",
  title: "リスト",
  items: [],
  defaultItemBgColor: "bg-blue-50",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

const baseItem: TodoItem = {
  id: "item-1",
  title: "アイテム",
  isCompleted: false,
  createdAt: "2026-10-01T00:00:00.000Z",
};

describe("createTodoItem", () => {
  it("bgColor 未指定時はリストの defaultItemBgColor を継承する", () => {
    const item = createTodoItem({ title: "牛乳" }, baseList, NOW);
    expect(item.id).toMatch(/^todo-item-\d+-[a-z0-9]+$/);
    expect(item).toMatchObject({
      title: "牛乳",
      isCompleted: false,
      bgColor: "bg-blue-50",
      createdAt: ISO,
    });
  });

  it("bgColor を明示指定した場合はリストのデフォルトより優先される", () => {
    const item = createTodoItem(
      { title: "卵", bgColor: "bg-red-50" },
      baseList,
      NOW,
    );
    expect(item.bgColor).toBe("bg-red-50");
  });

  it("bgColor に null を指定した場合は色を設定しない", () => {
    const item = createTodoItem({ title: "卵", bgColor: null }, baseList, NOW);
    expect("bgColor" in item).toBe(false);
  });

  it("categoryId や indent を指定して作成できる", () => {
    const item = createTodoItem(
      { title: "タスク", categoryId: "cat-1", indent: 2 },
      baseList,
      NOW,
    );
    expect(item.categoryId).toBe("cat-1");
    expect(item.indent).toBe(2);
  });
});

describe("applyItemPatch", () => {
  it("指定したフィールドを更新する", () => {
    const updated = applyItemPatch(baseItem, {
      title: "更新後",
      isCompleted: true,
      indent: 1,
    });
    expect(updated).toEqual({
      ...baseItem,
      title: "更新後",
      isCompleted: true,
      indent: 1,
    });
  });

  it("bgColor や categoryId に null を渡すと解除される", () => {
    const itemWithExtras: TodoItem = {
      ...baseItem,
      bgColor: "bg-green-50",
      categoryId: "cat-1",
    };
    const updated = applyItemPatch(itemWithExtras, {
      bgColor: null,
      categoryId: null,
    });
    expect("bgColor" in updated).toBe(false);
    expect("categoryId" in updated).toBe(false);
  });
});
