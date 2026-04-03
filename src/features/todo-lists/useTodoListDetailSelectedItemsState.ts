import { useState, type Dispatch, type SetStateAction } from "react";

export type SetSelectedItemIds = Dispatch<SetStateAction<Set<string>>>;

/**
 * 選択アイテムIDの生の state を管理するhook
 * 責務: selectedItemIds の useState のみ
 */
export const useTodoListDetailSelectedItemsState = () => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  return {
    selectedItemIds,
    setSelectedItemIds,
  };
};
