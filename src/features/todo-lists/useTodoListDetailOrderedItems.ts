import { useMemo } from "react";
import { groupItemsByCategoryWithCompletedAtEnd } from "./todoListCategoryGroupWithCompletedAtEndSort";
import { createTodoListDetailOrderedItemsResult } from "./todoListDetailOrderedItemsResult";
import type { TodoCategory, TodoListItem } from "./types";

type UseTodoListDetailOrderedItemsParams = {
  filteredItems: TodoListItem[];
  categoryLookup: Map<string, TodoCategory>;
};

/**
 * 表示順は常に「未完了→完了済み」を最優先とし、各セクション内を
 * カテゴリ別（初出順、未分類は最後）、カテゴリ内は元の相対順序で固定する。
 */
export const useTodoListDetailOrderedItems = ({
  filteredItems,
  categoryLookup,
}: UseTodoListDetailOrderedItemsParams) => {
  const orderedItems = useMemo(
    () => groupItemsByCategoryWithCompletedAtEnd(filteredItems, categoryLookup),
    [filteredItems, categoryLookup],
  );

  return createTodoListDetailOrderedItemsResult({ visibleItems: orderedItems });
};
