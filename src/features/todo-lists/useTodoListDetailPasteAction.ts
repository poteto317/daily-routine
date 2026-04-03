import { useCallback } from "react";
import type { TodoListItem } from "./types";

type UseTodoListDetailPasteActionParams = {
  listId: string;
  clipboardItems: TodoListItem[];
  onPasteItems: (listId: string, items: TodoListItem[]) => void;
  onClearClipboard: () => void;
};

/**
 * ペースト操作のハンドラを提供するhook
 * 責務: クリップボードのアイテムをリストに貼り付け、クリップボードをクリア
 */
export const useTodoListDetailPasteAction = ({
  listId,
  clipboardItems,
  onPasteItems,
  onClearClipboard,
}: UseTodoListDetailPasteActionParams) => {
  const handlePaste = useCallback(() => {
    if (clipboardItems.length === 0) return;
    onPasteItems(listId, clipboardItems);
    onClearClipboard();
  }, [listId, clipboardItems, onPasteItems, onClearClipboard]);

  return { handlePaste };
};
