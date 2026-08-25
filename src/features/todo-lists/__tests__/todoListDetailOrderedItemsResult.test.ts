import { createTodoListDetailOrderedItemsResult } from "../todoListDetailOrderedItemsResult";
import type { TodoListItem } from "../types";

describe("createTodoListDetailOrderedItemsResult", () => {
  it("visibleItems の公開 shape を返す", () => {
    const visibleItems: TodoListItem[] = [];

    expect(createTodoListDetailOrderedItemsResult({ visibleItems })).toEqual({
      visibleItems,
    });
  });

  it("複数アイテムでも shape をそのまま返す", () => {
    const visibleItems = [
      { id: "item-1", title: "A", isCompleted: false, createdAt: "" },
      { id: "item-2", title: "B", isCompleted: true, createdAt: "" },
    ] as TodoListItem[];

    expect(createTodoListDetailOrderedItemsResult({ visibleItems })).toEqual({
      visibleItems,
    });
  });

  it("visibleItems の参照をそのまま伝播する（参照同一性）", () => {
    const visibleItems = [{ id: "item-1" } as TodoListItem];

    const result = createTodoListDetailOrderedItemsResult({ visibleItems });

    expect(result.visibleItems).toBe(visibleItems);
  });
});
