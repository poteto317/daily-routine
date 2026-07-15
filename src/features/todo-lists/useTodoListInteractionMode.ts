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

  // sortModeActive中はsortCompletedToBottomが完了状態のみでフラットに再グルーピングする一方、
  // reorderItemsInListは生配列のインデント隣接関係でブロック（親子）を判定するため、
  // 完了状態の異なる親子ブロックが存在すると並び替えで意図しない再親子付けが起きうる
  // （同一完了状態同士のドラッグでも、対象アイテム間に他アイテムが挿入されることで発生しうる）。
  // また完了/未完了の境界を跨ぐドラッグは再描画時のグルーピングで見た目上無効化される。
  // hideCompleted中は表示中アイテムが単一の完了状態のみのため、この問題は発生しない。
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
