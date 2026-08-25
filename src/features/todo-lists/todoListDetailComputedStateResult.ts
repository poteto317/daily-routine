import type { useTodoListDetailCollapsedItems } from "./useTodoListDetailCollapsedItems";
import type { useTodoListDetailHideCompleted } from "./useTodoListDetailHideCompleted";
import type { useTodoListDetailOrderedItems } from "./useTodoListDetailOrderedItems";
import type { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import type { TodoCategory } from "./types";

type TodoListDetailProgress = ReturnType<typeof useTodoListDetailProgress>;
type TodoListDetailOrderedItems = ReturnType<
  typeof useTodoListDetailOrderedItems
>;
type TodoListDetailHideCompleted = ReturnType<
  typeof useTodoListDetailHideCompleted
>;
type TodoListDetailCollapsedItems = ReturnType<
  typeof useTodoListDetailCollapsedItems
>;

type CreateTodoListDetailComputedStateResultParams = {
  detailProgress: TodoListDetailProgress;
  detailOrderedItems: TodoListDetailOrderedItems;
  detailHideCompleted: TodoListDetailHideCompleted;
  detailCollapsedItems: TodoListDetailCollapsedItems;
  categoryLookup: Map<string, TodoCategory>;
};

export const createTodoListDetailComputedStateResult = ({
  detailProgress,
  detailOrderedItems,
  detailHideCompleted,
  detailCollapsedItems,
  categoryLookup,
}: CreateTodoListDetailComputedStateResultParams) => {
  return {
    collapsedItemIds: detailCollapsedItems.collapsedItemIds,
    hideCompleted: detailHideCompleted.hideCompleted,
    toggleCollapseItem: detailCollapsedItems.toggleCollapseItem,
    toggleHideCompleted: detailHideCompleted.toggleHideCompleted,
    progress: detailProgress.progress,
    visibleItems: detailOrderedItems.visibleItems,
    categoryLookup,
  };
};
