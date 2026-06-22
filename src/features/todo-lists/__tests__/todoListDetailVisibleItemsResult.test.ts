import { createTodoListDetailVisibleItemsResult } from "../todoListDetailVisibleItemsResult";

describe("createTodoListDetailVisibleItemsResult", () => {
  it("filteredItems の公開 shape を返す", () => {
    const filteredItems = [
      {
        id: "item-1",
        title: "Task 1",
        isCompleted: false,
        createdAt: "2026-03-07T00:00:00.000Z",
      },
    ];

    expect(createTodoListDetailVisibleItemsResult({ filteredItems })).toEqual({
      filteredItems,
    });
  });

  it("空配列でも shape をそのまま返す", () => {
    expect(
      createTodoListDetailVisibleItemsResult({ filteredItems: [] }),
    ).toEqual({ filteredItems: [] });
  });

  it("複数アイテムでも shape をそのまま返す", () => {
    const filteredItems = [
      { id: "item-1", title: "A", isCompleted: false, createdAt: "" },
      { id: "item-2", title: "B", isCompleted: true, createdAt: "" },
    ];
    expect(createTodoListDetailVisibleItemsResult({ filteredItems })).toEqual({
      filteredItems,
    });
  });
});
