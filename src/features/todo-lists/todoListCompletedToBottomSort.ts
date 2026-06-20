import type { TodoListItem } from "./types";

export const sortCompletedToBottom = (items: TodoListItem[]): TodoListItem[] => [
  ...items.filter((item) => !item.isCompleted),
  ...items.filter((item) => item.isCompleted),
];
