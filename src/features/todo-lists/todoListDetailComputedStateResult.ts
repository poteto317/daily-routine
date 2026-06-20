import type { useTodoListDetailItemOrder } from "./useTodoListDetailItemOrder";
import type { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import type { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import type { useTodoListDetailVisibility } from "./useTodoListDetailVisibility";

type TodoListDetailProgress = ReturnType<typeof useTodoListDetailProgress>;
type TodoListDetailOrderedItems = ReturnType<typeof useTodoListDetailOrderedItems>;
type TodoListDetailVisibility = ReturnType<typeof useTodoListDetailVisibility>;
type TodoListDetailItemOrder = ReturnType<typeof useTodoListDetailItemOrder>;

type CreateTodoListDetailComputedStateResultParams = {
  detailProgress: TodoListDetailProgress;
  detailOrderedItems: TodoListDetailOrderedItems;
  detailVisibility: TodoListDetailVisibility;
  detailItemOrder: TodoListDetailItemOrder;
};

export const createTodoListDetailComputedStateResult = ({
  detailProgress,
  detailOrderedItems,
  detailVisibility,
  detailItemOrder,
}: CreateTodoListDetailComputedStateResultParams) => {
  return {
    collapsedItemIds: detailVisibility.collapsedItemIds,
    hideCompleted: detailVisibility.hideCompleted,
    moveCompletedToBottom: detailItemOrder.moveCompletedToBottom,
    toggleCollapseItem: detailVisibility.toggleCollapseItem,
    toggleHideCompleted: detailVisibility.toggleHideCompleted,
    toggleMoveCompletedToBottom: detailItemOrder.toggleMoveCompletedToBottom,
    progress: detailProgress.progress,
    visibleItems: detailOrderedItems.visibleItems,
  };
};
