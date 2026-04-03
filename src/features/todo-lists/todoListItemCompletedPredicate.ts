import type { TodoListItem } from "./types";

export const isItemCompleted = (item: TodoListItem): boolean =>
  item.isCompleted;
