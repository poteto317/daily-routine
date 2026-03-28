import type { Dispatch, SetStateAction } from "react";

type CreateTodoListManagementTitleEditingResultParams = {
  cancelEditListTitle: () => void;
  commitEditListTitle: () => void;
  editingListId: string | null;
  editingListTitleValue: string;
  setEditingListTitleValue: Dispatch<SetStateAction<string>>;
  startEditListTitle: (listId: string, currentTitle: string) => void;
};

export const createTodoListManagementTitleEditingResult = ({
  cancelEditListTitle,
  commitEditListTitle,
  editingListId,
  editingListTitleValue,
  setEditingListTitleValue,
  startEditListTitle,
}: CreateTodoListManagementTitleEditingResultParams) => {
  return {
    cancelEditListTitle,
    commitEditListTitle,
    editingListId,
    editingListTitleValue,
    setEditingListTitleValue,
    startEditListTitle,
  };
};
