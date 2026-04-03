import { filterCollapsedItems } from "./todoListCollapsedItemsFilter";
import { filterIncompleteItems } from "./todoListIncompleteItemsFilter";
import type { TodoListItem } from "./types";

export const getVisibleTodoItems = (
  items: TodoListItem[],
  hideCompleted: boolean,
  collapsedItemIds: ReadonlySet<string> = new Set(),
): TodoListItem[] => {
  if (!hideCompleted) {
    return filterCollapsedItems(items, collapsedItemIds);
  }

  const visibleItemIds = new Set(
    filterIncompleteItems(items).map((item) => item.id),
  );
  const effectiveCollapsedItemIds = new Set(
    [...collapsedItemIds].filter((itemId) => visibleItemIds.has(itemId)),
  );
  const afterCollapse = filterCollapsedItems(items, effectiveCollapsedItemIds);

  return afterCollapse.filter((item) => visibleItemIds.has(item.id));
};
