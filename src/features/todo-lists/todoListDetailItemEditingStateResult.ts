import type { Dispatch, SetStateAction } from "react";

type TodoListDetailItemEditingStateResultInput = {
  editingItemId: string | null;
  editingItemTitle: string;
  setEditingItemId: Dispatch<SetStateAction<string | null>>;
  setEditingItemTitle: Dispatch<SetStateAction<string>>;
  startEditItem: (itemId: string, currentTitle: string) => void;
};

export const createTodoListDetailItemEditingStateResult = ({
  editingItemId,
  editingItemTitle,
  setEditingItemId,
  setEditingItemTitle,
  startEditItem,
}: TodoListDetailItemEditingStateResultInput) => ({
  editingItemId,
  editingItemTitle,
  setEditingItemId,
  setEditingItemTitle,
  startEditItem,
});
