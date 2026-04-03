import type { TodoListItem } from "./types";

export const getItemIndentLevel = (item: TodoListItem): number =>
  item.indent ?? 0;
