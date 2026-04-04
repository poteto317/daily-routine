import type { PersistTodoLists, TodoList } from "./types";

export const persistTodoLists = (params: {
  nextLists: TodoList[];
  setLists: PersistTodoLists;
  saveLists: PersistTodoLists;
}): void => {
  const { nextLists, setLists, saveLists } = params;

  setLists(nextLists);
  saveLists(nextLists);
};
