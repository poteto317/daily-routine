import { useEffect } from "react";
import type { TodoListItem } from "./types";
import { useTodoListInlineInsert } from "./useTodoListInlineInsert";
import { useTodoListDragAndDrop } from "./useTodoListDragAndDrop";

export type UseTodoListInteractionModeParams = {
  listId: string;
  items: TodoListItem[];
  onAddItem: (listId: string, title: string, insertAfterIndex?: number) => void;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
};

export const useTodoListInteractionMode = ({
  listId,
  items,
  onAddItem,
  onReorderItems,
}: UseTodoListInteractionModeParams) => {
  // 表示順は常に「未完了→完了済み、カテゴリ別」でソートされ生配列の順序と
  // 乖離するため、DnD・インライン挿入は常時無効。
  // reorderItemsInListは生配列のインデント隣接関係でブロック（親子）を判定する
  // ため、表示順が生配列と異なる状態での並び替えは意図しない再親子付けを
  // 起こしうる（DnDの仕組み自体は、将来「同一セクション・同一カテゴリ内のみ
  // 許可」等の再設計余地を残すため温存している）。
  const sortModeActive = true;

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
    sortModeActive,
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
