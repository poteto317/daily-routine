import type { useTodoListDetailCollapsedItems } from "./useTodoListDetailCollapsedItems";
import type { useTodoListDetailHideCompleted } from "./useTodoListDetailHideCompleted";
import type { useTodoListDetailItemOrder } from "./useTodoListDetailItemOrder";
import type { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import type { useTodoListDetailProgress } from "./useTodoListDetailProgress";

type TodoListDetailProgress = ReturnType<typeof useTodoListDetailProgress>;
type TodoListDetailOrderedItems = ReturnType<typeof useTodoListDetailOrderedItems>;
type TodoListDetailHideCompleted = ReturnType<typeof useTodoListDetailHideCompleted>;
type TodoListDetailCollapsedItems = ReturnType<typeof useTodoListDetailCollapsedItems>;
type TodoListDetailItemOrder = ReturnType<typeof useTodoListDetailItemOrder>;

type CreateTodoListDetailComputedStateResultParams = {
  detailProgress: TodoListDetailProgress;
  detailOrderedItems: TodoListDetailOrderedItems;
  detailHideCompleted: TodoListDetailHideCompleted;
  detailCollapsedItems: TodoListDetailCollapsedItems;
  detailItemOrder: TodoListDetailItemOrder;
};

export const createTodoListDetailComputedStateResult = ({
  detailProgress,
  detailOrderedItems,
  detailHideCompleted,
  detailCollapsedItems,
  detailItemOrder,
}: CreateTodoListDetailComputedStateResultParams) => {
  return {
    collapsedItemIds: detailCollapsedItems.collapsedItemIds,
    hideCompleted: detailHideCompleted.hideCompleted,
    moveCompletedToBottom: detailItemOrder.moveCompletedToBottom,
    toggleCollapseItem: detailCollapsedItems.toggleCollapseItem,
    toggleHideCompleted: detailHideCompleted.toggleHideCompleted,
    toggleMoveCompletedToBottom: detailItemOrder.toggleMoveCompletedToBottom,
    progress: detailProgress.progress,
    visibleItems: detailOrderedItems.visibleItems,
  };
};
