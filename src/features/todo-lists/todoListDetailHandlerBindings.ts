import type { PersistTodoLists, TodoList } from "./types";

type TodoListDetailHandlerBindingsArgs = {
  list: TodoList | null;
  lists: TodoList[];
  persist: PersistTodoLists;
};

export const createTodoListDetailHandlerBindings = ({
  list,
  lists,
  persist,
}: TodoListDetailHandlerBindingsArgs) => {
  return {
    list,
    lists,
    persist,
  };
};
