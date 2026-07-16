import type { useTodoListDetailCollapsedItems } from "./useTodoListDetailCollapsedItems";
import type { useTodoListDetailHideCompleted } from "./useTodoListDetailHideCompleted";
import type { useTodoListDetailItemOrder } from "./useTodoListDetailItemOrder";
import type { useTodoListDetailGroupByCategory } from "./useTodoListDetailGroupByCategory";
import type { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import type { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import type { TodoCategory } from "./types";

type TodoListDetailProgress = ReturnType<typeof useTodoListDetailProgress>;
type TodoListDetailOrderedItems = ReturnType<typeof useTodoListDetailOrderedItems>;
type TodoListDetailHideCompleted = ReturnType<typeof useTodoListDetailHideCompleted>;
type TodoListDetailCollapsedItems = ReturnType<typeof useTodoListDetailCollapsedItems>;
type TodoListDetailItemOrder = ReturnType<typeof useTodoListDetailItemOrder>;
type TodoListDetailGroupByCategory = ReturnType<
  typeof useTodoListDetailGroupByCategory
>;

type CreateTodoListDetailComputedStateResultParams = {
  detailProgress: TodoListDetailProgress;
  detailOrderedItems: TodoListDetailOrderedItems;
  detailHideCompleted: TodoListDetailHideCompleted;
  detailCollapsedItems: TodoListDetailCollapsedItems;
  detailItemOrder: TodoListDetailItemOrder;
  detailGroupByCategory: TodoListDetailGroupByCategory;
  categoryLookup: Map<string, TodoCategory>;
};

export const createTodoListDetailComputedStateResult = ({
  detailProgress,
  detailOrderedItems,
  detailHideCompleted,
  detailCollapsedItems,
  detailItemOrder,
  detailGroupByCategory,
  categoryLookup,
}: CreateTodoListDetailComputedStateResultParams) => {
  return {
    collapsedItemIds: detailCollapsedItems.collapsedItemIds,
    hideCompleted: detailHideCompleted.hideCompleted,
    moveCompletedToBottom: detailItemOrder.moveCompletedToBottom,
    groupByCategory: detailGroupByCategory.groupByCategory,
    toggleCollapseItem: detailCollapsedItems.toggleCollapseItem,
    toggleHideCompleted: detailHideCompleted.toggleHideCompleted,
    toggleMoveCompletedToBottom: detailItemOrder.toggleMoveCompletedToBottom,
    toggleGroupByCategory: detailGroupByCategory.toggleGroupByCategory,
    progress: detailProgress.progress,
    visibleItems: detailOrderedItems.visibleItems,
    categoryLookup,
  };
};
