import type { TodoListItem } from "./types";

export const sortCompletedToBottom = (items: TodoListItem[]): TodoListItem[] => {
  const incomplete: TodoListItem[] = [];
  const completed: TodoListItem[] = [];
  for (const item of items) {
    if (item.isCompleted) {
      completed.push(item);
    } else {
      incomplete.push(item);
    }
  }
  return [...incomplete, ...completed];
};
