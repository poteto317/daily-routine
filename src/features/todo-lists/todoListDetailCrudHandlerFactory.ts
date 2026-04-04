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
import {
  createDeleteTodoListHandler,
  createUpdateListTitleHandler,
} from "./todoListDetailListHandlers";
import type { PersistTodoLists, TodoList } from "./types";

export const createTodoListDetailHandlers = (params: {
  lists: TodoList[];
  persist: PersistTodoLists;
  deleteItemConfirmTemplate: (title: string) => string;
  deleteListConfirmTemplate: (title: string) => string;
}) => {
  const {
    lists,
    persist,
    deleteItemConfirmTemplate,
    deleteListConfirmTemplate,
  } = params;

  return {
    onAddItem: createAddTodoItemHandler({ lists, persist }),
    onToggleItem: createToggleTodoItemHandler({ lists, persist }),
    onDeleteItem: createDeleteTodoItemHandler({
      lists,
      persist,
      deleteItemConfirmTemplate,
    }),
    onDeleteList: createDeleteTodoListHandler({
      lists,
      persist,
      deleteListConfirmTemplate,
    }),
    onIndentItem: createIndentTodoItemHandler({ lists, persist }),
    onOutdentItem: createOutdentTodoItemHandler({ lists, persist }),
    onReorderItems: createReorderTodoItemsHandler({ lists, persist }),
    onUpdateItemTitle: createUpdateTodoItemTitleHandler({ lists, persist }),
    onUpdateListTitle: createUpdateListTitleHandler({ lists, persist }),
    onUpdateItemBgColor: createUpdateTodoItemBgColorHandler({ lists, persist }),
    onUpdateAllItemsBgColor: createUpdateAllTodoItemsBgColorHandler({
      lists,
      persist,
    }),
    onCutItems: createCutTodoItemsHandler({ lists, persist }),
    onPasteItems: createPasteTodoItemsHandler({ lists, persist }),
  };
};
