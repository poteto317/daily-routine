import { isItemCompleted } from "./todoListItemCompletedPredicate";
import type { TodoList } from "./types";

export const getListProgress = (
  list: TodoList,
): { completed: number; total: number; percentage: number } => {
  const total = list.items.length;
  const completed = list.items.filter(isItemCompleted).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
};
