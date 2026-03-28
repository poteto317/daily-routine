import {
  addItemToList,
  createTodoListItem,
  deleteItemFromList,
  indentItemInList,
  outdentItemInList,
  reorderItemsInList,
  toggleItemInList,
  updateItemTitleInList,
  updateListTitle,
} from "./helpers";
import { removeTodoList } from "./management";
import type { TodoList } from "./types";

type ConfirmDelete = (message: string) => boolean;

type SetLists = (lists: TodoList[]) => void;
type SaveLists = (lists: TodoList[]) => void;

export const persistTodoLists = (params: {
  nextLists: TodoList[];
  setLists: SetLists;
  saveLists: SaveLists;
}): void => {
  const { nextLists, setLists, saveLists } = params;

  setLists(nextLists);
  saveLists(nextLists);
};

export const addTodoItemToLists = (params: {
  lists: TodoList[];
  listId: string;
  title: string;
}): TodoList[] => {
  const { lists, listId, title } = params;

  return addItemToList(lists, listId, createTodoListItem(title));
};

export const toggleTodoItemInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
}): TodoList[] => {
  const { lists, listId, itemId } = params;

  return toggleItemInList(lists, listId, itemId);
};

export const confirmAndDeleteTodoList = (params: {
  lists: TodoList[];
  list: TodoList;
  message: string;
  confirmDelete: ConfirmDelete;
}): TodoList[] | null => {
  const { lists, list, message, confirmDelete } = params;

  if (!confirmDelete(message)) {
    return null;
  }

  return removeTodoList(lists, list.id);
};

export const confirmAndDeleteTodoItem = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
  message: string;
  confirmDelete: ConfirmDelete;
}): TodoList[] | null => {
  const { lists, listId, itemId, message, confirmDelete } = params;

  if (!confirmDelete(message)) {
    return null;
  }

  return deleteItemFromList(lists, listId, itemId);
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
