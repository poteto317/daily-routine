import type { TodoList } from "./types";
import {
  addTodoList,
  removeTodoList,
  toggleTodoListVisibility,
} from "./management";
import { updateListTitle } from "./helpers";

type PersistTodoListsArgs = {
  nextLists: TodoList[];
  setLists: (lists: TodoList[]) => void;
  saveLists: (lists: TodoList[]) => void;
};

type CreateTodoListArgs = {
  lists: TodoList[];
  titleInput: string;
  persist: (lists: TodoList[]) => void;
};

type DeleteTodoListArgs = {
  lists: TodoList[];
  list: TodoList;
  message: string;
  persist: (lists: TodoList[]) => void;
  confirmDelete?: (message: string) => boolean;
};

type TodoListFormState = {
  showForm: boolean;
  titleInput: string;
};

export const persistManagedTodoLists = ({
  nextLists,
  setLists,
  saveLists,
}: PersistTodoListsArgs): void => {
  setLists(nextLists);
  saveLists(nextLists);
};

export const createClosedTodoListFormState = (): TodoListFormState => {
  return {
    showForm: false,
    titleInput: "",
  };
};

export const createTodoListAndPersist = ({
  lists,
  titleInput,
  persist,
}: CreateTodoListArgs): TodoList[] | null => {
  const nextLists = addTodoList(lists, titleInput);
  if (nextLists === lists) {
    return null;
  }

  persist(nextLists);
  return nextLists;
};

export const toggleTodoListVisibilityAndPersist = (
  lists: TodoList[],
  listId: string,
  persist: (lists: TodoList[]) => void,
): TodoList[] => {
  const nextLists = toggleTodoListVisibility(lists, listId);
  persist(nextLists);
  return nextLists;
};

export const deleteTodoListAndPersist = ({
  lists,
  list,
  message,
  persist,
  confirmDelete = (nextMessage) => window.confirm(nextMessage),
}: DeleteTodoListArgs): TodoList[] | null => {
  if (!confirmDelete(message)) {
    return null;
  }

  const nextLists = removeTodoList(lists, list.id);
  persist(nextLists);
  return nextLists;
};

export const renameTodoListAndPersist = (
  lists: TodoList[],
  listId: string,
  title: string,
  persist: (lists: TodoList[]) => void,
): TodoList[] => {
  const nextLists = updateListTitle(lists, listId, title);
  persist(nextLists);
  return nextLists;
};

export const shouldFocusTodoListForm = (showForm: boolean): boolean => {
  return showForm;
};

export const isTodoListVisible = (list: TodoList): boolean => !list.isHidden;

export type { TodoListFormState };
