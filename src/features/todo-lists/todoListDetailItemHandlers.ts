import { normalizeTitle } from "./todoListTitleNormalization";
import type { TodoList } from "./types";
import {
  addTodoItemAndPersist,
  deleteTodoItemAndPersist,
  indentTodoItemAndPersist,
  outdentTodoItemAndPersist,
  reorderTodoItemsAndPersist,
  toggleTodoItemAndPersist,
  updateTodoItemTitleAndPersist,
} from "./pageStateActions";

type TodoListsHandlerArgs = {
  lists: TodoList[];
  persist: (next: TodoList[]) => void;
};

export const createAddTodoItemHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, title: string) => {
    addTodoItemAndPersist({ lists, listId, title, persist });
  };
};

export const createToggleTodoItemHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, itemId: string) => {
    toggleTodoItemAndPersist({ lists, listId, itemId, persist });
  };
};

export const createDeleteTodoItemHandler = ({
  lists,
  persist,
  deleteItemConfirmTemplate,
}: TodoListsHandlerArgs & {
  deleteItemConfirmTemplate: (title: string) => string;
}) => {
  return (listId: string, itemId: string, title: string) => {
    deleteTodoItemAndPersist({
      lists,
      listId,
      itemId,
      title,
      message: deleteItemConfirmTemplate(title),
      persist,
    });
  };
};

export const createIndentTodoItemHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, itemId: string) => {
    indentTodoItemAndPersist({ lists, listId, itemId, persist });
  };
};

export const createOutdentTodoItemHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, itemId: string) => {
    outdentTodoItemAndPersist({ lists, listId, itemId, persist });
  };
};

export const createReorderTodoItemsHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, fromIndex: number, toIndex: number) => {
    reorderTodoItemsAndPersist({ lists, listId, fromIndex, toIndex, persist });
  };
};

export const createUpdateTodoItemTitleHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, itemId: string, title: string) => {
    const normalized = normalizeTitle(title);
    if (!normalized) return;
    updateTodoItemTitleAndPersist({
      lists,
      listId,
      itemId,
      title: normalized,
      persist,
    });
  };
};
