import type { TodoList } from "./types";
import { normalizeTitle } from "./todoListTitleNormalization";
import {
  createTodoListAndPersist,
  deleteTodoListAndPersist,
  renameTodoListAndPersist,
  toggleTodoListVisibilityAndPersist,
} from "./managementPageStateActions";

export const createTodoListCreateHandler = (params: {
  lists: TodoList[];
  titleInput: string;
  persist: (lists: TodoList[]) => void;
  closeForm: () => void;
}) => {
  const { lists, titleInput, persist, closeForm } = params;

  return () => {
    const nextLists = createTodoListAndPersist({
      lists,
      titleInput,
      persist,
    });

    if (!nextLists) {
      return null;
    }

    closeForm();
    return nextLists;
  };
};

export const createTodoListVisibilityToggleHandler = (params: {
  lists: TodoList[];
  persist: (lists: TodoList[]) => void;
}) => {
  const { lists, persist } = params;

  return (list: TodoList) => {
    return toggleTodoListVisibilityAndPersist(lists, list.id, persist);
  };
};

export const createTodoListDeleteHandler = (params: {
  lists: TodoList[];
  persist: (lists: TodoList[]) => void;
  buildDeleteMessage: (list: TodoList) => string;
}) => {
  const { lists, persist, buildDeleteMessage } = params;

  return (list: TodoList) => {
    return deleteTodoListAndPersist({
      lists,
      list,
      message: buildDeleteMessage(list),
      persist,
    });
  };
};

export const createTodoListRenameHandler = (params: {
  lists: TodoList[];
  persist: (lists: TodoList[]) => void;
}) => {
  const { lists, persist } = params;

  return (listId: string, title: string) => {
    const normalized = normalizeTitle(title);
    if (!normalized) return;
    renameTodoListAndPersist(lists, listId, normalized, persist);
  };
};
