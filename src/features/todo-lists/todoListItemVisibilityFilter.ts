import { filterCollapsedItems } from "./todoListCollapsedItemsFilter";
import { filterIncompleteItems } from "./todoListIncompleteItemsFilter";
import type { TodoListItem } from "./types";

export const getVisibleTodoItems = (
  items: TodoListItem[],
  hideCompleted: boolean,
  collapsedItemIds: ReadonlySet<string> = new Set(),
): TodoListItem[] => {
  const afterCollapse = filterCollapsedItems(items, collapsedItemIds);
  return hideCompleted ? filterIncompleteItems(afterCollapse) : afterCollapse;
};
