import type { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import type { useTodoListDetailVisibleItems } from "./useTodoListDetailVisibleItems";
import type { useTodoListDetailVisibility } from "./useTodoListDetailVisibility";

type TodoListDetailProgress = ReturnType<typeof useTodoListDetailProgress>;
type TodoListDetailVisibleItems = ReturnType<
  typeof useTodoListDetailVisibleItems
>;
type TodoListDetailVisibility = ReturnType<typeof useTodoListDetailVisibility>;

type CreateTodoListDetailComputedStateResultParams = {
  detailProgress: TodoListDetailProgress;
  detailVisibleItems: TodoListDetailVisibleItems;
  detailVisibility: TodoListDetailVisibility;
};

export const createTodoListDetailComputedStateResult = ({
  detailProgress,
  detailVisibleItems,
  detailVisibility,
}: CreateTodoListDetailComputedStateResultParams) => {
  return {
    collapsedItemIds: detailVisibility.collapsedItemIds,
    hideCompleted: detailVisibility.hideCompleted,
    toggleCollapseItem: detailVisibility.toggleCollapseItem,
    toggleHideCompleted: detailVisibility.toggleHideCompleted,
    progress: detailProgress.progress,
    visibleItems: detailVisibleItems.visibleItems,
  };
};
