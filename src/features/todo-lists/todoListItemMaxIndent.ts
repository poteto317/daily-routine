import { getItemIndentLevel } from "./todoListItemIndentLevel";
import type { TodoListItem } from "./types";

export const getMaxAllowedIndent = (
  items: TodoListItem[],
  index: number,
): number => {
  if (index === 0) return 0;
  return Math.min(getItemIndentLevel(items[index - 1]) + 1, 3);
};
