import { deleteItemFromList } from "./todoListItemContentMutations";
import type { TodoList } from "./types";

export type ConfirmDelete = (message: string) => boolean;

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
