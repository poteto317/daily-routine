import { useCallback } from "react";
import type { TodoListItem } from "./types";

type UseTodoListDetailCutActionParams = {
  listId: string;
  selectedItemIds: ReadonlySet<string>;
  clearSelection: () => void;
  onCutItems: (listId: string, itemIds: ReadonlySet<string>) => TodoListItem[];
  onSetClipboard: (items: TodoListItem[]) => void;
};

/**
 * カット操作のハンドラを提供するhook
 * 責務: 選択アイテムの切り取りとクリップボードへの保存
 */
export const useTodoListDetailCutAction = ({
  listId,
  selectedItemIds,
  clearSelection,
  onCutItems,
  onSetClipboard,
}: UseTodoListDetailCutActionParams) => {
  const handleCut = useCallback(() => {
    if (selectedItemIds.size === 0) return;
    const cutItems = onCutItems(listId, selectedItemIds);
    onSetClipboard(cutItems);
    clearSelection();
  }, [listId, selectedItemIds, clearSelection, onCutItems, onSetClipboard]);

  return { handleCut };
};
