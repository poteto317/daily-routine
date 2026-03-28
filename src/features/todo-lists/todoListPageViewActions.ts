import type { Dispatch, SetStateAction } from "react";
import type { TodoList } from "./types";
import {
  createAddTodoItemHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createReorderTodoItemsHandler,
  createUpdateTodoItemTitleHandler,
  createToggleTodoItemHandler,
} from "./todoListDetailItemHandlers";
import {
  createDeleteTodoListHandler,
  createUpdateListTitleHandler,
} from "./todoListDetailListHandlers";

type TodoListPersist = (next: TodoList[]) => void;

export const addTodoItemFromDetailInput = (params: {
  inputText: string;
  listId: string;
  onAddItem: (listId: string, title: string) => void;
  clearInput: () => void;
  focusInput: () => void;
}): boolean => {
  const { inputText, listId, onAddItem, clearInput, focusInput } = params;
  const trimmed = inputText.trim();

  if (!trimmed) {
    return false;
  }

  onAddItem(listId, trimmed);
  clearInput();
  focusInput();
  return true;
};

export const createCompletedVisibilityToggleHandler = (
  setHideCompleted: Dispatch<SetStateAction<boolean>>,
) => {
  return () => {
    setHideCompleted((value) => !value);
  };
};

export const createTodoListDetailHandlers = (params: {
  lists: TodoList[];
  persist: TodoListPersist;
  deleteItemConfirmTemplate: (title: string) => string;
  deleteListConfirmTemplate: (title: string) => string;
}) => {
  const {
    lists,
    persist,
    deleteItemConfirmTemplate,
    deleteListConfirmTemplate,
  } = params;

  return {
    onAddItem: createAddTodoItemHandler({ lists, persist }),
    onToggleItem: createToggleTodoItemHandler({ lists, persist }),
    onDeleteItem: createDeleteTodoItemHandler({
      lists,
      persist,
      deleteItemConfirmTemplate,
    }),
    onDeleteList: createDeleteTodoListHandler({
      lists,
      persist,
      deleteListConfirmTemplate,
    }),
    onIndentItem: createIndentTodoItemHandler({ lists, persist }),
    onOutdentItem: createOutdentTodoItemHandler({ lists, persist }),
    onReorderItems: createReorderTodoItemsHandler({ lists, persist }),
    onUpdateItemTitle: createUpdateTodoItemTitleHandler({ lists, persist }),
    onUpdateListTitle: createUpdateListTitleHandler({ lists, persist }),
  };
};
