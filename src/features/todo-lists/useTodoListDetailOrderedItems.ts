import { useMemo } from "react";
import { sortCompletedToBottom } from "./todoListCompletedToBottomSort";
import { groupItemsByCategoryWithCompletedAtEnd } from "./todoListCategoryGroupWithCompletedAtEndSort";
import { createTodoListDetailOrderedItemsResult } from "./todoListDetailOrderedItemsResult";
import type { TodoCategory, TodoListItem } from "./types";

type UseTodoListDetailOrderedItemsParams = {
  filteredItems: TodoListItem[];
  moveCompletedToBottom: boolean;
  groupByCategory: boolean;
  categoryLookup: Map<string, TodoCategory>;
};

export const useTodoListDetailOrderedItems = ({
  filteredItems,
  moveCompletedToBottom,
  groupByCategory,
  categoryLookup,
}: UseTodoListDetailOrderedItemsParams) => {
  const orderedItems = useMemo(() => {
    if (groupByCategory) {
      // カテゴリグルーピング中は完了アイテムを各グループ内に留めず、常に
      // 全体の末尾（カテゴリ別にグルーピングした状態）へ移動する。
      // moveCompletedToBottomの状態には依存しない。
      return groupItemsByCategoryWithCompletedAtEnd(filteredItems, categoryLookup);
    }
    return moveCompletedToBottom
      ? sortCompletedToBottom(filteredItems)
      : filteredItems;
  }, [filteredItems, moveCompletedToBottom, groupByCategory, categoryLookup]);

  return createTodoListDetailOrderedItemsResult({ visibleItems: orderedItems });
};
