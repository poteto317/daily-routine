import { createTodoListDetailStateResult } from "../todoListDetailStateResult";

describe("todoListDetailStateResult", () => {
  it("detail state の公開 shape を組み立てる", () => {
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const detailHandlers = {
      onAddItem: jest.fn(),
      onToggleItem: jest.fn(),
      onDeleteItem: jest.fn(),
      onDeleteList: jest.fn(),
      onIndentItem: jest.fn(),
      onOutdentItem: jest.fn(),
      onReorderItems: jest.fn(),
      onUpdateItemTitle: jest.fn(),
      onUpdateListTitle: jest.fn(),
      onUpdateListAddItemPosition: jest.fn(),
      onCutItems: jest.fn(),
      onPasteItems: jest.fn(),
      onUpdateItemBgColor: jest.fn(),
      onUpdateAllItemsBgColor: jest.fn(),
    };

    expect(
      createTodoListDetailStateResult({
        detailHandlers,
        list,
      }),
    ).toEqual({
      detailHandlers,
      list,
    });
  });
});
