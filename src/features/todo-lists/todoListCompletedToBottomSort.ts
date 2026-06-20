import type { TodoListItem } from "./types";

export const sortCompletedToBottom = (items: TodoListItem[]): TodoListItem[] => {
  const incomplete: TodoListItem[] = [];
  const complete: TodoListItem[] = [];
  for (const item of items) {
    if (item.isCompleted) {
      complete.push(item);
    } else {
      incomplete.push(item);
    }
  }
  return [...incomplete, ...complete];
};
