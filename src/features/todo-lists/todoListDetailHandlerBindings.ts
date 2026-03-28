import type { TodoList } from "./types";

type TodoListPersist = (next: TodoList[]) => void;

type TodoListDetailHandlerBindingsArgs = {
  list: TodoList | null;
  lists: TodoList[];
  persist: TodoListPersist;
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
