import type { TodoList } from "../types";
import {
  addTodoItemAndPersist,
  indentTodoItemAndPersist,
  outdentTodoItemAndPersist,
  reorderTodoItemsAndPersist,
  toggleTodoItemAndPersist,
  updateTodoItemTitleAndPersist,
} from "../pageStateActions";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [
    {
      id: "item-1",
      title: "Task 1",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
    {
      id: "item-2",
      title: "Task 2",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todo-lists pageStateActions", () => {
  it("Todo追加後に永続化する", () => {
    const persist = jest.fn();

    const nextLists = addTodoItemAndPersist({
      lists: [baseList],
      listId: "list-1",
      title: "New Task",
      persist,
    });

    expect(nextLists[0].items).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "New Task" })]),
    );
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("Todo完了切替後に永続化する", () => {
    const persist = jest.fn();

    const nextLists = toggleTodoItemAndPersist({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      persist,
    });

    expect(nextLists[0].items[0].isCompleted).toBe(true);
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("インデント後に永続化する", () => {
    const persist = jest.fn();
    const withIndent = indentTodoItemAndPersist({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-2",
      persist,
    });

    expect(withIndent[0].items[1].indent).toBe(1);
    expect(persist).toHaveBeenCalledWith(withIndent);
  });

  it("アウトデント後に永続化する", () => {
    const persist = jest.fn();
    const indentedList: TodoList = {
      ...baseList,
      items: [
        {
          id: "item-1",
          title: "Task 1",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "item-2",
          title: "Task 2",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
      ],
    };
    const withoutIndent = outdentTodoItemAndPersist({
      lists: [indentedList],
      listId: "list-1",
      itemId: "item-2",
      persist,
    });

    expect(withoutIndent[0].items[1].indent).toBe(0);
    expect(persist).toHaveBeenCalledWith(withoutIndent);
  });

  it("親アイテム並び替え時は子要素も含めて永続化する", () => {
    const persist = jest.fn();
    const nestedList: TodoList = {
      ...baseList,
      items: [
        {
          id: "item-1",
          title: "Parent",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
        {
          id: "item-2",
          title: "Child",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
          indent: 1,
        },
        {
          id: "item-3",
          title: "Sibling",
          isCompleted: false,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ],
    };

    const nextLists = reorderTodoItemsAndPersist({
      lists: [nestedList],
      listId: "list-1",
      fromIndex: 0,
      toIndex: 2,
      persist,
    });

    expect(nextLists[0].items.map((item) => item.id)).toEqual([
      "item-3",
      "item-1",
      "item-2",
    ]);
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("アイテムタイトル更新後に永続化する", () => {
    const persist = jest.fn();

    const nextLists = updateTodoItemTitleAndPersist({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      title: "Updated Task",
      persist,
    });

    expect(nextLists[0].items[0].title).toBe("Updated Task");
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("アイテムタイトル更新は対象アイテムのみ変更する", () => {
    const persist = jest.fn();

    const nextLists = updateTodoItemTitleAndPersist({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      title: "Changed",
      persist,
    });

    expect(nextLists[0].items[0].title).toBe("Changed");
    expect(nextLists[0].items[1].title).toBe("Task 2");
  });
});
