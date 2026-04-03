import type { useTodoListCollapseItemActions } from "./useTodoListCollapseItemActions";
import type { useTodoListCollapsedItemsState } from "./useTodoListCollapsedItemsState";
import type { useTodoListHideCompletedActions } from "./useTodoListHideCompletedActions";
import type { useTodoListHideCompletedState } from "./useTodoListHideCompletedState";

type TodoListHideCompletedActions = ReturnType<
  typeof useTodoListHideCompletedActions
>;
type TodoListCollapseItemActions = ReturnType<
  typeof useTodoListCollapseItemActions
>;
type TodoListHideCompletedState = ReturnType<
  typeof useTodoListHideCompletedState
>;
type TodoListCollapsedItemsState = ReturnType<
  typeof useTodoListCollapsedItemsState
>;

type CreateTodoListDetailVisibilityResultParams = {
  hideCompletedActions: TodoListHideCompletedActions;
  collapseItemActions: TodoListCollapseItemActions;
  hideCompletedState: TodoListHideCompletedState;
  collapsedItemsState: TodoListCollapsedItemsState;
};

export const createTodoListDetailVisibilityResult = ({
  hideCompletedActions,
  collapseItemActions,
  hideCompletedState,
  collapsedItemsState,
}: CreateTodoListDetailVisibilityResultParams) => ({
  collapsedItemIds: collapsedItemsState.collapsedItemIds,
  hideCompleted: hideCompletedState.hideCompleted,
  toggleCollapseItem: collapseItemActions.toggleCollapseItem,
  toggleHideCompleted: hideCompletedActions.toggleHideCompleted,
});
