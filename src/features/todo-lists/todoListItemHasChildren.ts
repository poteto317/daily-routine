import { getItemIndentLevel } from "./todoListItemIndentLevel";
import type { TodoListItem } from "./types";

export const hasChildren = (items: TodoListItem[], index: number): boolean => {
  if (index < 0 || index >= items.length - 1) return false;
  return (
    getItemIndentLevel(items[index + 1]) > getItemIndentLevel(items[index])
  );
};
