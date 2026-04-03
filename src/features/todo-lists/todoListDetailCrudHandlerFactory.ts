import {
  createAddTodoItemHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createReorderTodoItemsHandler,
  createUpdateTodoItemTitleHandler,
  createToggleTodoItemHandler,
} from "./todoListDetailItemHandlers";
import {
  createDeleteTodoListHandler,
  createUpdateListTitleHandler,
} from "./todoListDetailListHandlers";
import type { TodoList } from "./types";

type TodoListPersist = (next: TodoList[]) => void;

export const createTodoListDetailHandlers = (params: {
  lists: TodoList[];
  persist: TodoListPersist;
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
  };
};
