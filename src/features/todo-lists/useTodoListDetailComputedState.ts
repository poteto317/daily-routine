import type { TodoList } from "./types";
import { createTodoListDetailComputedStateResult } from "./todoListDetailComputedStateResult";
import { useTodoListDetailCollapsedItems } from "./useTodoListDetailCollapsedItems";
import { useTodoListDetailHideCompleted } from "./useTodoListDetailHideCompleted";
import { useTodoListDetailItemOrder } from "./useTodoListDetailItemOrder";
import { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "./useTodoListDetailVisibleItems";

type UseTodoListDetailComputedStateParams = {
  list: TodoList;
  onUpdateListMoveCompletedToBottom: (
    listId: string,
    moveCompletedToBottom: boolean,
  ) => void;
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
};

export const useTodoListDetailComputedState = ({
  list,
  onUpdateListMoveCompletedToBottom,
  onUpdateListHideCompleted,
}: UseTodoListDetailComputedStateParams) => {
  const detailHideCompleted = useTodoListDetailHideCompleted({
    list,
    onUpdateListHideCompleted,
  });
  const detailCollapsedItems = useTodoListDetailCollapsedItems();
  const detailItemOrder = useTodoListDetailItemOrder({
    list,
    onUpdateListMoveCompletedToBottom,
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
  });

  return createTodoListDetailComputedStateResult({
    detailProgress,
    detailOrderedItems,
    detailHideCompleted,
    detailCollapsedItems,
    detailItemOrder,
  });
};
