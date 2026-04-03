import { isItemCompleted } from "./todoListItemCompletedPredicate";
import type { TodoListItem } from "./types";

export const filterIncompleteItems = (
  items: TodoListItem[],
): TodoListItem[] => {
  return items.filter((item) => !isItemCompleted(item));
};
