import type { TodoList } from "../types";
import {
  addTodoItemFromDetailInput,
  createCompletedVisibilityToggleHandler,
  createTodoListDetailHandlers,
} from "../todoListPageViewActions";

jest.mock("../todoListDetailItemHandlers", () => ({
  createAddTodoItemHandler: jest.fn(),
  createDeleteTodoItemHandler: jest.fn(),
  createIndentTodoItemHandler: jest.fn(),
  createOutdentTodoItemHandler: jest.fn(),
  createReorderTodoItemsHandler: jest.fn(),
  createToggleTodoItemHandler: jest.fn(),
  createUpdateTodoItemTitleHandler: jest.fn(),
}));

jest.mock("../todoListDetailListHandlers", () => ({
  createDeleteTodoListHandler: jest.fn(),
  createUpdateListTitleHandler: jest.fn(),
}));

import {
  createAddTodoItemHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createReorderTodoItemsHandler,
  createToggleTodoItemHandler,
  createUpdateTodoItemTitleHandler,
} from "../todoListDetailItemHandlers";
import {
  createDeleteTodoListHandler,
  createUpdateListTitleHandler,
} from "../todoListDetailListHandlers";

const list: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListPageViewActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("入力値から Todo 追加を実行し、成功時に入力をリセットする", () => {
    const onAddItem = jest.fn();
    const clearInput = jest.fn();
    const focusInput = jest.fn();

    expect(
      addTodoItemFromDetailInput({
        inputText: " New Task ",
        listId: "list-1",
        onAddItem,
        clearInput,
        focusInput,
      }),
    ).toBe(true);

    expect(onAddItem).toHaveBeenCalledWith("list-1", "New Task");
    expect(clearInput).toHaveBeenCalled();
    expect(focusInput).toHaveBeenCalled();

    expect(
      addTodoItemFromDetailInput({
        inputText: "   ",
        listId: "list-1",
        onAddItem,
        clearInput,
        focusInput,
      }),
    ).toBe(false);
  });

  it("完了済み表示 toggle handler を作る", () => {
    const setHideCompleted = jest.fn();
    createCompletedVisibilityToggleHandler(setHideCompleted)();

    const updater = setHideCompleted.mock.calls[0][0] as (
      value: boolean,
    ) => boolean;
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  it("詳細 view 用 handler 群を組み立てる", () => {
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
    (createUpdateListTitleHandler as jest.Mock).mockReturnValue(
      onUpdateListTitle,
    );

    const deleteItemConfirmTemplate = jest.fn(
      (title: string) => `item:${title}`,
    );
    const deleteListConfirmTemplate = jest.fn(
      (title: string) => `list:${title}`,
    );

    const handlers = createTodoListDetailHandlers({
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
    expect(createUpdateListTitleHandler).toHaveBeenCalledWith({
      lists: [list],
      persist,
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
    });
  });
});
