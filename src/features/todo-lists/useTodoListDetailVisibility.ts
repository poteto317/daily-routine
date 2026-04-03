import { createTodoListDetailVisibilityResult } from "./todoListDetailVisibilityResult";
import { useTodoListCollapseItemActions } from "./useTodoListCollapseItemActions";
import { useTodoListCollapsedItemsState } from "./useTodoListCollapsedItemsState";
import { useTodoListHideCompletedActions } from "./useTodoListHideCompletedActions";
import { useTodoListHideCompletedState } from "./useTodoListHideCompletedState";

export const useTodoListDetailVisibility = () => {
  const hideCompletedState = useTodoListHideCompletedState();
  const collapsedItemsState = useTodoListCollapsedItemsState();
  const hideCompletedActions = useTodoListHideCompletedActions({
    setHideCompleted: hideCompletedState.setHideCompleted,
  });
  const collapseItemActions = useTodoListCollapseItemActions({
    setCollapsedItemIds: collapsedItemsState.setCollapsedItemIds,
  });

  return createTodoListDetailVisibilityResult({
    hideCompletedActions,
    collapseItemActions,
    hideCompletedState,
    collapsedItemsState,
  });
};
