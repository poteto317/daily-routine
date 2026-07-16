import { useMemo } from "react";
import type { TodoCategory, TodoList } from "./types";
import { buildTodoCategoryLookup } from "./todoCategoryLookup";
import { createTodoListDetailComputedStateResult } from "./todoListDetailComputedStateResult";
import { useTodoListDetailCollapsedItems } from "./useTodoListDetailCollapsedItems";
import { useTodoListDetailHideCompleted } from "./useTodoListDetailHideCompleted";
import { useTodoListDetailItemOrder } from "./useTodoListDetailItemOrder";
import { useTodoListDetailGroupByCategory } from "./useTodoListDetailGroupByCategory";
import { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "./useTodoListDetailVisibleItems";

type UseTodoListDetailComputedStateParams = {
  list: TodoList;
  categories: TodoCategory[];
  onUpdateListMoveCompletedToBottom: (
    listId: string,
    moveCompletedToBottom: boolean,
  ) => void;
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
  onUpdateListGroupByCategory: (
    listId: string,
    groupByCategory: boolean,
  ) => void;
};

export const useTodoListDetailComputedState = ({
  list,
  categories,
  onUpdateListMoveCompletedToBottom,
  onUpdateListHideCompleted,
  onUpdateListGroupByCategory,
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
  const detailItemOrder = useTodoListDetailItemOrder({
    list,
    onUpdateListMoveCompletedToBottom,
  });
  const detailGroupByCategory = useTodoListDetailGroupByCategory({
    list,
    onUpdateListGroupByCategory,
  });
  const detailProgress = useTodoListDetailProgress({ list });
  const detailVisibleItems = useTodoListDetailVisibleItems({
    hideCompleted: detailHideCompleted.hideCompleted,
    collapsedItemIds: detailCollapsedItems.collapsedItemIds,
    list,
  });
  const detailOrderedItems = useTodoListDetailOrderedItems({
    filteredItems: detailVisibleItems.filteredItems,
    moveCompletedToBottom: detailItemOrder.moveCompletedToBottom,
    groupByCategory: detailGroupByCategory.groupByCategory,
    categoryLookup,
  });

  return createTodoListDetailComputedStateResult({
    detailProgress,
    detailOrderedItems,
    detailHideCompleted,
    detailCollapsedItems,
    detailItemOrder,
    detailGroupByCategory,
    categoryLookup,
  });
};
