import { useMemo } from "react";
import type { TodoCategory, TodoList } from "./types";
import { buildTodoCategoryLookup } from "./todoCategoryLookup";
import { createTodoListDetailComputedStateResult } from "./todoListDetailComputedStateResult";
import { useTodoListDetailCollapsedItems } from "./useTodoListDetailCollapsedItems";
import { useTodoListDetailHideCompleted } from "./useTodoListDetailHideCompleted";
import { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "./useTodoListDetailVisibleItems";

type UseTodoListDetailComputedStateParams = {
  list: TodoList;
  categories: TodoCategory[];
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
};

export const useTodoListDetailComputedState = ({
  list,
  categories,
  onUpdateListHideCompleted,
}: UseTodoListDetailComputedStateParams) => {
  const categoryLookup = useMemo(
    () => buildTodoCategoryLookup(categories),
    [categories],
  );
  const detailHideCompleted = useTodoListDetailHideCompleted({
    list,
    onUpdateListHideCompleted,
  });
  const detailCollapsedItems = useTodoListDetailCollapsedItems();
  const detailProgress = useTodoListDetailProgress({ list });
  const detailVisibleItems = useTodoListDetailVisibleItems({
    hideCompleted: detailHideCompleted.hideCompleted,
    collapsedItemIds: detailCollapsedItems.collapsedItemIds,
    list,
  });
  const detailOrderedItems = useTodoListDetailOrderedItems({
    filteredItems: detailVisibleItems.filteredItems,
    categoryLookup,
  });

  return createTodoListDetailComputedStateResult({
    detailProgress,
    detailOrderedItems,
    detailHideCompleted,
    detailCollapsedItems,
    categoryLookup,
  });
};
