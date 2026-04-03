import {
  createDeleteItemConfirmMessage,
  createDeleteListConfirmMessage,
} from "./todoListDetailConfirmMessages";
import { createTodoListDetailHandlers } from "./todoListDetailCrudHandlerFactory";
import type { TodoList } from "./types";

type TodoListPersist = (next: TodoList[]) => void;

export const useTodoListDetailHandlers = ({
  list,
  lists,
  persist,
}: {
  list: TodoList | null;
  lists: TodoList[];
  persist: TodoListPersist;
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
