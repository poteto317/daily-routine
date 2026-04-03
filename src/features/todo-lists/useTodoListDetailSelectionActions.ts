import { useCallback } from "react";
import type { SetSelectedItemIds } from "./useTodoListDetailSelectedItemsState";

type UseTodoListDetailSelectionActionsParams = {
  setSelectedItemIds: SetSelectedItemIds;
};

/**
 * 選択操作のアクションを提供するhook
 * 責務: toggleSelectItem と clearSelection のみ
 */
export const useTodoListDetailSelectionActions = ({
  setSelectedItemIds,
}: UseTodoListDetailSelectionActionsParams) => {
  const toggleSelectItem = useCallback(
    (itemId: string) => {
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
    },
    [setSelectedItemIds],
  );

  const clearSelection = useCallback(
    () => setSelectedItemIds(new Set()),
    [setSelectedItemIds],
  );

  return {
    toggleSelectItem,
    clearSelection,
  };
};
