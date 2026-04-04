import {
  createDeleteItemConfirmMessage,
  createDeleteListConfirmMessage,
} from "./todoListDetailConfirmMessages";
import { createTodoListDetailHandlers } from "./todoListDetailCrudHandlerFactory";
import type { PersistTodoLists, TodoList } from "./types";

export const useTodoListDetailHandlers = ({
  list,
  lists,
  persist,
}: {
  list: TodoList | null;
  lists: TodoList[];
  persist: PersistTodoLists;
}) => {
  if (!list) {
    return {
      detailHandlers: null,
    };
  }

  return {
    detailHandlers: createTodoListDetailHandlers({
      lists,
      persist,
      deleteItemConfirmTemplate: createDeleteItemConfirmMessage,
      deleteListConfirmTemplate: createDeleteListConfirmMessage,
    }),
  };
};
