import type { TodoList } from "./types";
import { createTodoListDetailComputedStateResult } from "./todoListDetailComputedStateResult";
import { useTodoListDetailItemOrder } from "./useTodoListDetailItemOrder";
import { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "./useTodoListDetailVisibleItems";
import { useTodoListDetailVisibility } from "./useTodoListDetailVisibility";

type UseTodoListDetailComputedStateParams = {
  list: TodoList;
};

export const useTodoListDetailComputedState = ({
  list,
}: UseTodoListDetailComputedStateParams) => {
  const detailVisibility = useTodoListDetailVisibility();
  const detailItemOrder = useTodoListDetailItemOrder();
  const detailProgress = useTodoListDetailProgress({ list });
  const detailVisibleItems = useTodoListDetailVisibleItems({
    hideCompleted: detailVisibility.hideCompleted,
    collapsedItemIds: detailVisibility.collapsedItemIds,
    list,
  });
  const detailOrderedItems = useTodoListDetailOrderedItems({
    filteredItems: detailVisibleItems.filteredItems,
    moveCompletedToBottom: detailItemOrder.moveCompletedToBottom,
  });

  return createTodoListDetailComputedStateResult({
    detailProgress,
    detailOrderedItems,
    detailVisibility,
    detailItemOrder,
  });
};
