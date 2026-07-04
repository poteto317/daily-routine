import { createTodoListDetailCollapsedItemsResult } from "./todoListDetailCollapsedItemsResult";
import { useTodoListCollapseItemActions } from "./useTodoListCollapseItemActions";
import { useTodoListCollapsedItemsState } from "./useTodoListCollapsedItemsState";

export const useTodoListDetailCollapsedItems = () => {
  const collapsedItemsState = useTodoListCollapsedItemsState();
  const collapseItemActions = useTodoListCollapseItemActions({
    setCollapsedItemIds: collapsedItemsState.setCollapsedItemIds,
  });

  return createTodoListDetailCollapsedItemsResult({
    collapsedItemsState,
    collapseItemActions,
  });
};
