import { useEffect } from "react";
import type { TodoListItem } from "./types";
import { useTodoListInlineInsert } from "./useTodoListInlineInsert";
import { useTodoListDragAndDrop } from "./useTodoListDragAndDrop";

export type UseTodoListInteractionModeParams = {
  listId: string;
  items: TodoListItem[];
  onAddItem: (listId: string, title: string, insertAfterIndex?: number) => void;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
  moveCompletedToBottom: boolean;
  hideCompleted: boolean;
};

export const useTodoListInteractionMode = ({
  listId,
  items,
  onAddItem,
  onReorderItems,
  moveCompletedToBottom,
  hideCompleted,
}: UseTodoListInteractionModeParams) => {
  const sortModeActive = moveCompletedToBottom && !hideCompleted;

  const inlineInsert = useTodoListInlineInsert({ listId, onAddItem });
  const { closeInlineInsert } = inlineInsert;

  // ソートモード中は表示順とデータ順が乖離し挿入位置が特定できないため、フォームを閉じ新規挿入も封じる
  useEffect(() => {
    if (sortModeActive) closeInlineInsert();
  }, [sortModeActive, closeInlineInsert]);

  const openInlineInsert = (itemId: string) => {
    if (sortModeActive) return;
    inlineInsert.openInlineInsert(itemId);
  };

  const dnd = useTodoListDragAndDrop({
    items,
    listId,
    onReorderItems,
    onDragStarted: closeInlineInsert,
    disabled: sortModeActive,
  });

  const activeItem = items.find((i) => i.id === dnd.activeId) ?? null;

  return {
    inlineInsert: {
      insertAfterId: inlineInsert.insertAfterId,
      inlineInputText: inlineInsert.inlineInputText,
      setInlineInputText: inlineInsert.setInlineInputText,
      openInlineInsert,
      closeInlineInsert,
      handleInlineAdd: inlineInsert.handleInlineAdd,
    },
    dnd,
    activeItem,
  };
};
