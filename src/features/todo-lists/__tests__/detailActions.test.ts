import * as detailActions from "../detailActions";

describe("todo-lists detailActions compatibility barrel", () => {
  it("all item and list actions are exported and callable", () => {
    expect(detailActions.addTodoItemToLists).toBeDefined();
    expect(detailActions.toggleTodoItemInLists).toBeDefined();
    expect(detailActions.indentTodoItemInLists).toBeDefined();
    expect(detailActions.outdentTodoItemInLists).toBeDefined();
    expect(detailActions.reorderTodoItemsInLists).toBeDefined();
    expect(detailActions.updateTodoItemTitleInLists).toBeDefined();
    expect(detailActions.updateTodoListTitleInLists).toBeDefined();
    expect(detailActions.updateTodoListAddItemPositionInLists).toBeDefined();

    // Verify executions
    expect(
      detailActions.addTodoItemToLists({
        lists: [],
        listId: "l1",
        title: "item",
      }),
    ).toEqual([]);
    expect(
      detailActions.toggleTodoItemInLists({
        lists: [],
        listId: "l1",
        itemId: "i1",
      }),
    ).toEqual([]);
    expect(
      detailActions.indentTodoItemInLists({
        lists: [],
        listId: "l1",
        itemId: "i1",
      }),
    ).toEqual([]);
    expect(
      detailActions.outdentTodoItemInLists({
        lists: [],
        listId: "l1",
        itemId: "i1",
      }),
    ).toEqual([]);
    expect(
      detailActions.reorderTodoItemsInLists({
        lists: [],
        listId: "l1",
        fromIndex: 0,
        toIndex: 1,
      }),
    ).toEqual([]);
    expect(
      detailActions.updateTodoItemTitleInLists({
        lists: [],
        listId: "l1",
        itemId: "i1",
        title: "new",
      }),
    ).toEqual([]);
    expect(
      detailActions.updateTodoListTitleInLists({
        lists: [],
        listId: "l1",
        title: "new title",
      }),
    ).toEqual([]);
    expect(
      detailActions.updateTodoListAddItemPositionInLists({
        lists: [],
        listId: "l1",
        position: "first",
      }),
    ).toEqual([]);
  });
});
