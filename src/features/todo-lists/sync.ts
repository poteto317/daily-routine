import type { TodoList } from "./types";
import { saveTodoLists } from "./storage";

export const saveAndSyncTodoLists = (lists: TodoList[]): void => {
  saveTodoLists(lists);
};
