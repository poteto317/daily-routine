import { getItemIndentLevel } from "./todoListItemIndentLevel";
import type { TodoListItem } from "./types";

export const filterCollapsedItems = (
  items: TodoListItem[],
  collapsedItemIds: ReadonlySet<string>,
): TodoListItem[] => {
  if (collapsedItemIds.size === 0) return items;

  const result: TodoListItem[] = [];
  let collapsedDepth = Infinity;

  for (const item of items) {
    const indent = getItemIndentLevel(item);

    if (indent > collapsedDepth) {
      continue;
    }

    collapsedDepth = collapsedItemIds.has(item.id) ? indent : Infinity;
    result.push(item);
  }

  return result;
};
