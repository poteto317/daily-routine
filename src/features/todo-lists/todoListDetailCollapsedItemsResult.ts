import type { useTodoListCollapseItemActions } from "./useTodoListCollapseItemActions";
import type { useTodoListCollapsedItemsState } from "./useTodoListCollapsedItemsState";

type TodoListCollapseItemActions = ReturnType<
  typeof useTodoListCollapseItemActions
>;
type TodoListCollapsedItemsState = ReturnType<
  typeof useTodoListCollapsedItemsState
>;

type CreateTodoListDetailCollapsedItemsResultParams = {
  collapsedItemsState: TodoListCollapsedItemsState;
  collapseItemActions: TodoListCollapseItemActions;
};

export const createTodoListDetailCollapsedItemsResult = ({
  collapsedItemsState,
  collapseItemActions,
}: CreateTodoListDetailCollapsedItemsResultParams) => ({
  collapsedItemIds: collapsedItemsState.collapsedItemIds,
  toggleCollapseItem: collapseItemActions.toggleCollapseItem,
});
