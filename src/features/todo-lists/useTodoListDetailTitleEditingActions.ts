import { useCallback } from "react";

type UseTodoListDetailTitleEditingActionsParams = {
  listId: string;
  listTitle: string;
  editingListTitleValue: string;
  onUpdateListTitle: (listId: string, title: string) => void;
  setEditingListTitle: (value: boolean) => void;
  setEditingListTitleValue: (value: string) => void;
};

export const useTodoListDetailTitleEditingActions = ({
  listId,
  listTitle,
  editingListTitleValue,
  onUpdateListTitle,
  setEditingListTitle,
  setEditingListTitleValue,
}: UseTodoListDetailTitleEditingActionsParams) => {
  const startEditListTitle = useCallback(() => {
    setEditingListTitleValue(listTitle);
    setEditingListTitle(true);
  }, [listTitle, setEditingListTitle, setEditingListTitleValue]);

  const commitEditListTitle = useCallback(() => {
    onUpdateListTitle(listId, editingListTitleValue);
    setEditingListTitle(false);
  }, [editingListTitleValue, listId, onUpdateListTitle, setEditingListTitle]);

  const cancelEditListTitle = useCallback(() => {
    setEditingListTitle(false);
  }, [setEditingListTitle]);

  return {
    cancelEditListTitle,
    commitEditListTitle,
    startEditListTitle,
  };
};
