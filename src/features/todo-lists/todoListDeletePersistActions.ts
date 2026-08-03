import {
  confirmAndDeleteTodoItem,
  type ConfirmDelete,
} from "./todoListConfirmDeleteActions";
import type { PersistTodoLists, TodoList } from "./types";

type DeleteTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  message: string;
  persist: PersistTodoLists;
  confirmDelete?: ConfirmDelete;
};

export const deleteTodoItemAndPersist = ({
  lists,
  listId,
  itemId,
  message,
  persist,
  confirmDelete = (nextMessage) => window.confirm(nextMessage),
}: DeleteTodoItemArgs): TodoList[] | null => {
  const nextLists = confirmAndDeleteTodoItem({
    lists,
    listId,
    itemId,
    message,
    confirmDelete,
  });

  if (!nextLists) {
    return null;
  }

  persist(nextLists);
  return nextLists;
};
