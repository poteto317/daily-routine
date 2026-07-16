import { useMemo } from "react";
import { sortCompletedToBottom } from "./todoListCompletedToBottomSort";
import { groupItemsByCategory } from "./todoListCategoryGroupSort";
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
      // カテゴリでグルーピングした上で、完了アイテムを下へ移動するソートは
      // 各グループの内部にのみ適用する（グループを跨いでまとめると
      // 「カテゴリごとにまとめる」目的自体が壊れるため）。
      return groupItemsByCategory(filteredItems, categoryLookup, {
        sortCompletedToBottomWithinGroup: moveCompletedToBottom,
      });
    }
    return moveCompletedToBottom
      ? sortCompletedToBottom(filteredItems)
      : filteredItems;
  }, [filteredItems, moveCompletedToBottom, groupByCategory, categoryLookup]);

  return createTodoListDetailOrderedItemsResult({ visibleItems: orderedItems });
};
