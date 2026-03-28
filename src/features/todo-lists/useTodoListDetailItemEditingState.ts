import { useCallback, useState } from "react";
import { createTodoListDetailItemEditingStateResult } from "./todoListDetailItemEditingStateResult";

export const useTodoListDetailItemEditingState = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemTitle, setEditingItemTitle] = useState("");

  const startEditItem = useCallback((itemId: string, currentTitle: string) => {
    setEditingItemId(itemId);
    setEditingItemTitle(currentTitle);
  }, []);

  return createTodoListDetailItemEditingStateResult({
    editingItemId,
    editingItemTitle,
    setEditingItemId,
    setEditingItemTitle,
    startEditItem,
  });
};
