import { normalizeTodoTitle } from "./todoListTitleNormalization";

export const addTodoItemFromDetailInput = (params: {
  inputText: string;
  listId: string;
  onAddItem: (listId: string, title: string) => void;
  clearInput: () => void;
  focusInput: () => void;
}): boolean => {
  const { inputText, listId, onAddItem, clearInput, focusInput } = params;
  const normalized = normalizeTodoTitle(inputText);

  if (!normalized) {
    return false;
  }

  onAddItem(listId, normalized);
  clearInput();
  focusInput();
  return true;
};
