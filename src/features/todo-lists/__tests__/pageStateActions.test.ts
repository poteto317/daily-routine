import type { TodoList } from "../types";
import {
  addTodoItemAndPersist,
  deleteTodoItemAndPersist,
  deleteTodoListAndPersist,
  indentTodoItemAndPersist,
  outdentTodoItemAndPersist,
  reorderTodoItemsAndPersist,
  syncSelectedTodoListIdIfNeeded,
  toggleTodoItemAndPersist,
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
  it("選択IDが変わるときだけ同期する", () => {
    const setSelectedId = jest.fn();

    expect(
      syncSelectedTodoListIdIfNeeded("list-1", "missing", setSelectedId),
    ).toBe(true);
    expect(setSelectedId).toHaveBeenCalledWith("list-1");

    expect(
      syncSelectedTodoListIdIfNeeded("list-1", "list-1", setSelectedId),
    ).toBe(false);
  });

  it("リスト削除確認後に永続化する", () => {
    const persist = jest.fn();

    expect(
      deleteTodoListAndPersist({
        lists: [baseList],
        list: baseList,
        message: "delete?",
        persist,
        confirmDelete: jest.fn(() => true),
      }),
    ).toBe(true);
    expect(persist).toHaveBeenCalledWith([]);
  });

  it("リスト削除をキャンセルしたら永続化しない", () => {
    const persist = jest.fn();

    expect(
      deleteTodoListAndPersist({
        lists: [baseList],
        list: baseList,
        message: "delete?",
        persist,
        confirmDelete: jest.fn(() => false),
      }),
    ).toBe(false);
    expect(persist).not.toHaveBeenCalled();
  });

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

  it("Todo削除確認後に永続化する", () => {
    const persist = jest.fn();

    const nextLists = deleteTodoItemAndPersist({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      title: "Task 1",
      message: "delete?",
      persist,
      confirmDelete: jest.fn(() => true),
    });

    expect(nextLists?.[0].items).toHaveLength(1);
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("Todo削除キャンセル時は何もしない", () => {
    const persist = jest.fn();

    expect(
      deleteTodoItemAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        title: "Task 1",
        message: "delete?",
        persist,
        confirmDelete: jest.fn(() => false),
      }),
    ).toBeNull();
    expect(persist).not.toHaveBeenCalled();
  });

  it("インデント変更後に永続化する", () => {
    const persist = jest.fn();
    const withIndent = indentTodoItemAndPersist({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-2",
      persist,
    });

    expect(withIndent[0].items[1].indent).toBe(1);
    expect(persist).toHaveBeenCalledWith(withIndent);

    const outdentPersist = jest.fn();
    const withoutIndent = outdentTodoItemAndPersist({
      lists: withIndent,
      listId: "list-1",
      itemId: "item-2",
      persist: outdentPersist,
    });

    expect(withoutIndent[0].items[1].indent).toBe(0);
    expect(outdentPersist).toHaveBeenCalledWith(withoutIndent);
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
});
