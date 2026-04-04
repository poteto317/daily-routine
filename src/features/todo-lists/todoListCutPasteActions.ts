import { cutItemsFromList, pasteItemsToList } from "./todoListCutPasteHelpers";
import type { TodoList, TodoListItem } from "./types";

export const cutTodoItemsFromLists = (params: {
  lists: TodoList[];
  listId: string;
  itemIds: ReadonlySet<string>;
}): { updatedLists: TodoList[]; cutItems: TodoListItem[] } => {
  const { lists, listId, itemIds } = params;
  return cutItemsFromList(lists, listId, itemIds);
};

export const pasteTodoItemsToLists = (params: {
  lists: TodoList[];
  listId: string;
  items: TodoListItem[];
}): TodoList[] => {
  const { lists, listId, items } = params;
  return pasteItemsToList(lists, listId, items);
};
