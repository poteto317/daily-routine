import type { Dispatch, SetStateAction } from "react";
import { normalizeTitle } from "./todoListTitleNormalization";
export { createTodoListDetailHandlers } from "./todoListDetailCrudHandlerFactory";

export const addTodoItemFromDetailInput = (params: {
  inputText: string;
  listId: string;
  onAddItem: (listId: string, title: string) => void;
  clearInput: () => void;
  focusInput: () => void;
}): boolean => {
  const { inputText, listId, onAddItem, clearInput, focusInput } = params;
  const normalized = normalizeTitle(inputText);

  if (!normalized) {
    return false;
  }

  onAddItem(listId, normalized);
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
