import {
  confirmAndDeleteTodoItem,
  confirmAndDeleteTodoList,
  type ConfirmDelete,
} from "./todoListConfirmDeleteActions";
import type { PersistTodoLists, TodoList } from "./types";

type DeleteTodoListArgs = {
  lists: TodoList[];
  list: TodoList;
  message: string;
  persist: PersistTodoLists;
  confirmDelete?: ConfirmDelete;
};

type DeleteTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  message: string;
  persist: PersistTodoLists;
  confirmDelete?: ConfirmDelete;
};

export const deleteTodoListAndPersist = ({
  lists,
  list,
  message,
  persist,
  confirmDelete = (nextMessage) => window.confirm(nextMessage),
}: DeleteTodoListArgs): boolean => {
  const nextLists = confirmAndDeleteTodoList({
    lists,
    list,
    message,
    confirmDelete,
  });

  if (!nextLists) {
    return false;
  }

  persist(nextLists);
  return true;
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
