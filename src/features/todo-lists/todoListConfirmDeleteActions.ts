import { deleteItemFromList } from "./todoListItemContentMutations";
import { removeTodoList } from "./management";
import type { TodoList } from "./types";

export type ConfirmDelete = (message: string) => boolean;

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
