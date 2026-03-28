import { useCallback, useState } from "react";
import { createTodoListManagementTitleEditingResult } from "./todoListManagementTitleEditingResult";

type UseTodoListManagementTitleEditingParams = {
  handleRename: (listId: string, title: string) => void;
};

export const useTodoListManagementTitleEditing = ({
  handleRename,
}: UseTodoListManagementTitleEditingParams) => {
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitleValue, setEditingListTitleValue] = useState("");

  const startEditListTitle = useCallback(
    (listId: string, currentTitle: string) => {
      setEditingListId(listId);
      setEditingListTitleValue(currentTitle);
    },
    [],
  );

  const commitEditListTitle = useCallback(() => {
    if (editingListId) {
      handleRename(editingListId, editingListTitleValue);
    }
    setEditingListId(null);
  }, [editingListId, editingListTitleValue, handleRename]);

  const cancelEditListTitle = useCallback(() => {
    setEditingListId(null);
  }, []);

  return createTodoListManagementTitleEditingResult({
    cancelEditListTitle,
    commitEditListTitle,
    editingListId,
    editingListTitleValue,
    setEditingListTitleValue,
    startEditListTitle,
  });
};
