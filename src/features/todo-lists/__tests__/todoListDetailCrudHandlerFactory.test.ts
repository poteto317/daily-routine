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

jest.mock("../todoListDetailCategoryHandlers", () => ({
  createUpdateTodoItemCategoryHandler: jest.fn(),
}));

jest.mock("../todoListDetailListHandlers", () => ({
  createUpdateListTitleHandler: jest.fn(),
  createUpdateListAddItemPositionHandler: jest.fn(),
  createUpdateListHideCompletedHandler: jest.fn(),
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
import { createUpdateTodoItemCategoryHandler } from "../todoListDetailCategoryHandlers";
import {
  createUpdateListAddItemPositionHandler,
  createUpdateListHideCompletedHandler,
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
    const onIndentItem = jest.fn();
    const onOutdentItem = jest.fn();
    const onReorderItems = jest.fn();
    const onUpdateItemTitle = jest.fn();
    const onUpdateListTitle = jest.fn();
    const onUpdateListAddItemPosition = jest.fn();
    const onUpdateListHideCompleted = jest.fn();
    const onUpdateItemBgColor = jest.fn();
    const onUpdateAllItemsBgColor = jest.fn();
    const onUpdateItemCategory = jest.fn();
    const onCutItems = jest.fn();
    const onPasteItems = jest.fn();

    (createAddTodoItemHandler as jest.Mock).mockReturnValue(onAddItem);
    (createToggleTodoItemHandler as jest.Mock).mockReturnValue(onToggleItem);
    (createDeleteTodoItemHandler as jest.Mock).mockReturnValue(onDeleteItem);
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
    (createUpdateTodoItemCategoryHandler as jest.Mock).mockReturnValue(
      onUpdateItemCategory,
    );
    (createUpdateListTitleHandler as jest.Mock).mockReturnValue(
      onUpdateListTitle,
    );
    (createUpdateListAddItemPositionHandler as jest.Mock).mockReturnValue(
      onUpdateListAddItemPosition,
    );
    (createUpdateListHideCompletedHandler as jest.Mock).mockReturnValue(
      onUpdateListHideCompleted,
    );
    (createCutTodoItemsHandler as jest.Mock).mockReturnValue(onCutItems);
    (createPasteTodoItemsHandler as jest.Mock).mockReturnValue(onPasteItems);

    const deleteItemConfirmTemplate = (title: string) =>
      `アイテム「${title}」を削除しますか？`;

    const handlers = createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
    });

    expect(handlers).toEqual({
      onAddItem,
      onToggleItem,
      onDeleteItem,
      onIndentItem,
      onOutdentItem,
      onReorderItems,
      onUpdateItemTitle,
      onUpdateListTitle,
      onUpdateListAddItemPosition,
      onUpdateListHideCompleted,
      onUpdateItemBgColor,
      onUpdateAllItemsBgColor,
      onUpdateItemCategory,
      onCutItems,
      onPasteItems,
    });
  });

  it("各ハンドラファクトリに lists と persist を渡す", () => {
    const persist = jest.fn();
    const deleteItemConfirmTemplate = (title: string) => `delete:${title}`;

    createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
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
    expect(createUpdateTodoItemCategoryHandler).toHaveBeenCalledWith({
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
    expect(createUpdateListHideCompletedHandler).toHaveBeenCalledWith({
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

    createTodoListDetailHandlers({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
    });

    expect(createDeleteTodoItemHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
      deleteItemConfirmTemplate,
    });
  });

  it("空リストでも正常に動作する", () => {
    const persist = jest.fn();
    const deleteItemConfirmTemplate = (title: string) => title;

    expect(() =>
      createTodoListDetailHandlers({
        lists: [],
        persist,
        deleteItemConfirmTemplate,
      }),
    ).not.toThrow();

    expect(createAddTodoItemHandler).toHaveBeenCalledWith({
      lists: [],
      persist,
    });
  });
});
