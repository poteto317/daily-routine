import { type createTodoListDetailHandlers } from "./todoListDetailCrudHandlerFactory";
import type { TodoList } from "./types";

type TodoListDetailHandlers = ReturnType<
  typeof createTodoListDetailHandlers
> | null;

type TodoListDetailStateResultArgs = {
  detailHandlers: TodoListDetailHandlers;
  list: TodoList | null;
};

export const createTodoListDetailStateResult = ({
  detailHandlers,
  list,
}: TodoListDetailStateResultArgs) => {
  return {
    detailHandlers,
    list,
  };
};
