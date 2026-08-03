import {
  createAddTodoItemHandler,
  createCutTodoItemsHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createPasteTodoItemsHandler,
  createReorderTodoItemsHandler,
  createUpdateTodoItemTitleHandler,
  createToggleTodoItemHandler,
} from "./todoListDetailItemHandlers";
import {
  createUpdateTodoItemBgColorHandler,
  createUpdateAllTodoItemsBgColorHandler,
} from "./todoListDetailBgColorHandlers";
import { createUpdateTodoItemCategoryHandler } from "./todoListDetailCategoryHandlers";
import {
  createUpdateListAddItemPositionHandler,
  createUpdateListHideCompletedHandler,
  createUpdateListTitleHandler,
} from "./todoListDetailListHandlers";
import type { PersistTodoLists, TodoList } from "./types";

export const createTodoListDetailHandlers = (params: {
  lists: TodoList[];
  persist: PersistTodoLists;
  deleteItemConfirmTemplate: (title: string) => string;
}) => {
  const { lists, persist, deleteItemConfirmTemplate } = params;

  return {
    onAddItem: createAddTodoItemHandler({ lists, persist }),
    onToggleItem: createToggleTodoItemHandler({ lists, persist }),
    onDeleteItem: createDeleteTodoItemHandler({
      lists,
      persist,
      deleteItemConfirmTemplate,
    }),
    onIndentItem: createIndentTodoItemHandler({ lists, persist }),
    onOutdentItem: createOutdentTodoItemHandler({ lists, persist }),
    onReorderItems: createReorderTodoItemsHandler({ lists, persist }),
    onUpdateItemTitle: createUpdateTodoItemTitleHandler({ lists, persist }),
    onUpdateListTitle: createUpdateListTitleHandler({ lists, persist }),
    onUpdateListAddItemPosition: createUpdateListAddItemPositionHandler({
      lists,
      persist,
    }),
    onUpdateListHideCompleted: createUpdateListHideCompletedHandler({
      lists,
      persist,
    }),
    onUpdateItemBgColor: createUpdateTodoItemBgColorHandler({ lists, persist }),
    onUpdateAllItemsBgColor: createUpdateAllTodoItemsBgColorHandler({
      lists,
      persist,
    }),
    onUpdateItemCategory: createUpdateTodoItemCategoryHandler({
      lists,
      persist,
    }),
    onCutItems: createCutTodoItemsHandler({ lists, persist }),
    onPasteItems: createPasteTodoItemsHandler({ lists, persist }),
  };
};
