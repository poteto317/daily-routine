import { useCallback, type Dispatch, type SetStateAction } from "react";

type UseTodoListDetailItemEditingActionsParams = {
  editingItemTitle: string;
  listId: string;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
  setEditingItemId: Dispatch<SetStateAction<string | null>>;
};

export const useTodoListDetailItemEditingActions = ({
  editingItemTitle,
  listId,
  onUpdateItemTitle,
  setEditingItemId,
}: UseTodoListDetailItemEditingActionsParams) => {
  const commitEditItem = useCallback(
    (itemId: string) => {
      onUpdateItemTitle(listId, itemId, editingItemTitle);
      setEditingItemId(null);
    },
    [editingItemTitle, listId, onUpdateItemTitle, setEditingItemId],
  );

  const cancelEditItem = useCallback(() => {
    setEditingItemId(null);
  }, [setEditingItemId]);

  return {
    cancelEditItem,
    commitEditItem,
  };
};
