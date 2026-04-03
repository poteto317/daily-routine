import { useState, type Dispatch, type SetStateAction } from "react";
import type { TodoListItem } from "./types";

export type SetClipboardItems = Dispatch<SetStateAction<TodoListItem[]>>;

/**
 * クリップボードアイテムの state を管理するhook
 * 責務: clipboardItems の useState のみ
 */
export const useTodoListDetailClipboardState = () => {
  const [clipboardItems, setClipboardItems] = useState<TodoListItem[]>([]);

  return {
    clipboardItems,
    setClipboardItems,
  };
};
