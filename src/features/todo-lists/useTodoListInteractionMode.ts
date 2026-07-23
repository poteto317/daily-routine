import { useCallback, useEffect } from "react";
import type { TodoCategory, TodoListItem } from "./types";
import { reorderTodoItemsIfSameSection } from "./todoListItemReorderAction";
import { useTodoListInlineInsert } from "./useTodoListInlineInsert";
import { useTodoListDragAndDrop } from "./useTodoListDragAndDrop";

export type UseTodoListInteractionModeParams = {
  listId: string;
  items: TodoListItem[];
  categoryLookup: Map<string, TodoCategory>;
  onAddItem: (listId: string, title: string, insertAfterIndex?: number) => void;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
};

export const useTodoListInteractionMode = ({
  listId,
  items,
  categoryLookup,
  onAddItem,
  onReorderItems,
}: UseTodoListInteractionModeParams) => {
  // 表示は常に「未完了→完了済み、カテゴリ別」でソートされ生配列の順序と
  // 乖離するため、インライン挿入は挿入位置を特定できず常時無効。
  const sortModeActive = true;

  const inlineInsert = useTodoListInlineInsert({ listId, onAddItem });
  const { closeInlineInsert } = inlineInsert;

  useEffect(() => {
    if (sortModeActive) closeInlineInsert();
  }, [sortModeActive, closeInlineInsert]);

  const openInlineInsert = (itemId: string) => {
    if (sortModeActive) return;
    inlineInsert.openInlineInsert(itemId);
  };

  // useTodoListDragAndDropはdnd-kitの汎用ラッパーであり、Todoのカテゴリ・完了状態
  // といったドメイン知識を持たない。「どの並び替えを実際に許可するか」という
  // ポリシー判定はドメイン知識を要するため、それを持つこの層でonReorderItemsを
  // ラップする（判定ロジック自体はtodoListItemReorderAction.tsに切り出し済み。
  // ここでは配線のみ）。インデント/アウトデント・スワイプは、対象アイテムの
  // 「生配列上の直前アイテム」を新しい親とみなす都合上、同一セクション内でも
  // 生配列上で隣接しているとは限らず意図しない再親子付けのリスクが残るため
  // 無効のまま。
  // なお、useTodoListDragAndDropはこのフックが渡したlistId自身をそのまま
  // コールバックへ返すだけなので、コールバック引数のlistIdは常にこの層の
  // listIdと同一。紛らわしい別名を付けず、外側のlistIdを直接使う。
  const handleReorderIfSameSection = useCallback(
    (_listId: string, fromIndex: number, toIndex: number) => {
      reorderTodoItemsIfSameSection({
        items,
        categoryLookup,
        listId,
        fromIndex,
        toIndex,
        onReorderItems,
      });
    },
    [items, categoryLookup, listId, onReorderItems],
  );

  const dnd = useTodoListDragAndDrop({
    items,
    listId,
    onReorderItems: handleReorderIfSameSection,
    onDragStarted: closeInlineInsert,
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
