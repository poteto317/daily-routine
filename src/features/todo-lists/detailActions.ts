import {
  addItemToList,
  indentItemInList,
  outdentItemInList,
  reorderItemsInList,
  toggleItemInList,
  updateItemTitleInList,
  updateListTitle,
} from "./helpers";
import { createTodoListItem } from "./todoListFactory";
import type { TodoList } from "./types";

export const addTodoItemToLists = (params: {
  lists: TodoList[];
  listId: string;
  title: string;
  insertAfterIndex?: number;
}): TodoList[] => {
  const { lists, listId, title, insertAfterIndex } = params;

  return addItemToList(
    lists,
    listId,
    createTodoListItem(title),
    insertAfterIndex,
  );
};

export const toggleTodoItemInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
}): TodoList[] => {
  const { lists, listId, itemId } = params;

  return toggleItemInList(lists, listId, itemId);
};

export const indentTodoItemInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
}): TodoList[] => {
  const { lists, listId, itemId } = params;

  return indentItemInList(lists, listId, itemId);
};

export const outdentTodoItemInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
}): TodoList[] => {
  const { lists, listId, itemId } = params;

  return outdentItemInList(lists, listId, itemId);
};

export const reorderTodoItemsInLists = (params: {
  lists: TodoList[];
  listId: string;
  fromIndex: number;
  toIndex: number;
}): TodoList[] => {
  const { lists, listId, fromIndex, toIndex } = params;

  return reorderItemsInList(lists, listId, fromIndex, toIndex);
};

export const updateTodoItemTitleInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
  title: string;
}): TodoList[] => {
  const { lists, listId, itemId, title } = params;

  return updateItemTitleInList(lists, listId, itemId, title);
};

export const updateTodoListTitleInLists = (params: {
  lists: TodoList[];
  listId: string;
  title: string;
}): TodoList[] => {
  const { lists, listId, title } = params;

  return updateListTitle(lists, listId, title);
};
