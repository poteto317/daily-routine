import { createTodoListDetailHandlers } from "../todoListDetailCrudHandlerFactory";

jest.mock("../todoListDetailItemHandlers", () => ({
  createAddTodoItemHandler: jest.fn(),
  createCutTodoItemsHandler: jest.fn(),
  createDeleteTodoItemHandler: jest.fn(),
  createIndentTodoItemHandler: jest.fn(),
  createOutdentTodoItemHandler: jest.fn(),
  createPasteTodoItemsHandler: jest.fn(),
  createReorderTodoItemsHandler: jest.fn(),
  createToggleTodoItemHandler: jest.fn(),
  createUpdateTodoItemTitleHandler: jest.fn(),
}));

jest.mock("../todoListDetailBgColorHandlers", () => ({
  createUpdateTodoItemBgColorHandler: jest.fn(),
  createUpdateAllTodoItemsBgColorHandler: jest.fn(),
}));

jest.mock("../todoListDetailListHandlers", () => ({
  createDeleteTodoListHandler: jest.fn(),
  createUpdateListTitleHandler: jest.fn(),
  createUpdateListAddItemPositionHandler: jest.fn(),
}));

import {
  createAddTodoItemHandler,
  createCutTodoItemsHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createPasteTodoItemsHandler,
  createReorderTodoItemsHandler,
  createToggleTodoItemHandler,
  createUpdateTodoItemTitleHandler,
} from "../todoListDetailItemHandlers";
import {
  createUpdateTodoItemBgColorHandler,
  createUpdateAllTodoItemsBgColorHandler,
} from "../todoListDetailBgColorHandlers";
import {
  createDeleteTodoListHandler,
  createUpdateListAddItemPositionHandler,
  createUpdateListTitleHandler,
} from "../todoListDetailListHandlers";
import type { TodoList } from "../types";

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListDetailCrudHandlerFactory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("全ての CRUD ハンドラを組み立てて返す", () => {
    const persist = jest.fn();
    const onAddItem = jest.fn();
    const onToggleItem = jest.fn();
    const onDeleteItem = jest.fn();
    const onDeleteList = jest.fn();
    const onIndentItem = jest.fn();
    const onOutdentItem = jest.fn();
    const onReorderItems = jest.fn();
    const onUpdateItemTitle = jest.fn();
    const onUpdateListTitle = jest.fn();
    const onUpdateListAddItemPosition = jest.fn();
    const onUpdateItemBgColor = jest.fn();
    const onUpdateAllItemsBgColor = jest.fn();
    const onCutItems = jest.fn();
    const onPasteItems = jest.fn();

    (createAddTodoItemHandler as jest.Mock).mockReturnValue(onAddItem);
    (createToggleTodoItemHandler as jest.Mock).mockReturnValue(onToggleItem);
    (createDeleteTodoItemHandler as jest.Mock).mockReturnValue(onDeleteItem);
    (createDeleteTodoListHandler as jest.Mock).mockReturnValue(onDeleteList);
    (createIndentTodoItemHandler as jest.Mock).mockReturnValue(onIndentItem);
    (createOutdentTodoItemHandler as jest.Mock).mockReturnValue(onOutdentItem);
    (createReorderTodoItemsHandler as jest.Mock).mockReturnValue(
      onReorderItems,
    );
    (createUpdateTodoItemTitleHandler as jest.Mock).mockReturnValue(
      onUpdateItemTitle,
    );
    (createUpdateTodoItemBgColorHandler as jest.Mock).mockReturnValue(
      onUpdateItemBgColor,
    );
    (createUpdateAllTodoItemsBgColorHandler as jest.Mock).mockReturnValue(
      onUpdateAllItemsBgColor,
    );
    (createUpdateListTitleHandler as jest.Mock).mockReturnValue(
      onUpdateListTitle,
    );
    (createUpdateListAddItemPositionHandler as jest.Mock).mockReturnValue(
      onUpdateListAddItemPosition,
    );
    (createCutTodoItemsHandler as jest.Mock).mockReturnValue(onCutItems);
    (createPasteTodoItemsHandler as jest.Mock).mockReturnValue(onPasteItems);

    const deleteItemConfirmTemplate = (title: string) =>
      `アイテム「${title}」を削除しますか？`;
    const deleteListConfirmTemplate = (title: string) =>
      `リスト「${title}」を削除しますか？`;

    const handlers = createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
      deleteListConfirmTemplate,
    });

    expect(handlers).toEqual({
      onAddItem,
      onToggleItem,
      onDeleteItem,
      onDeleteList,
      onIndentItem,
      onOutdentItem,
      onReorderItems,
      onUpdateItemTitle,
      onUpdateListTitle,
      onUpdateListAddItemPosition,
      onUpdateItemBgColor,
      onUpdateAllItemsBgColor,
      onCutItems,
      onPasteItems,
    });
  });

  it("各ハンドラファクトリに lists と persist を渡す", () => {
    const persist = jest.fn();
    const deleteItemConfirmTemplate = (title: string) => `delete:${title}`;
    const deleteListConfirmTemplate = (title: string) => `list:${title}`;

    createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
      deleteListConfirmTemplate,
    });

    expect(createAddTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createToggleTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createIndentTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createOutdentTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createReorderTodoItemsHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateTodoItemTitleHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateTodoItemBgColorHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateAllTodoItemsBgColorHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateListTitleHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createUpdateListAddItemPositionHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createCutTodoItemsHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
    expect(createPasteTodoItemsHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
    });
  });

  it("削除ハンドラに confirmTemplate を渡す", () => {
    const persist = jest.fn();
    const deleteItemConfirmTemplate = jest.fn(
      (title: string) => `item:${title}`,
    );
    const deleteListConfirmTemplate = jest.fn(
      (title: string) => `list:${title}`,
    );

    createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
      deleteListConfirmTemplate,
    });

    expect(createDeleteTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
    });
    expect(createDeleteTodoListHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteListConfirmTemplate,
    });
  });

  it("空リストでも正常に動作する", () => {
    const persist = jest.fn();
    const deleteItemConfirmTemplate = (title: string) => title;
    const deleteListConfirmTemplate = (title: string) => title;

    expect(() =>
      createTodoListDetailHandlers({
        lists: [],
        persist,
        deleteItemConfirmTemplate,
        deleteListConfirmTemplate,
      }),
    ).not.toThrow();

    expect(createAddTodoItemHandler).toHaveBeenCalledWith({
      lists: [],
      persist,
    });
  });
});
