import type { useTodoListDetailComputedValues } from "./useTodoListDetailComputedValues";
import type { useTodoListDetailVisibilityActions } from "./useTodoListDetailVisibilityActions";
import type { useTodoListDetailVisibilityState } from "./useTodoListDetailVisibilityState";

type TodoListDetailVisibilityState = ReturnType<
  typeof useTodoListDetailVisibilityState
>;
type TodoListDetailComputedValues = ReturnType<
  typeof useTodoListDetailComputedValues
>;
type TodoListDetailVisibilityActions = ReturnType<
  typeof useTodoListDetailVisibilityActions
>;

type CreateTodoListDetailComputedStateResultParams = {
  computedValues: TodoListDetailComputedValues;
  visibilityActions: TodoListDetailVisibilityActions;
  visibilityState: TodoListDetailVisibilityState;
};

export const createTodoListDetailComputedStateResult = ({
  computedValues,
  visibilityActions,
  visibilityState,
}: CreateTodoListDetailComputedStateResultParams) => {
  return {
    hideCompleted: visibilityState.hideCompleted,
    progress: computedValues.progress,
    toggleHideCompleted: visibilityActions.toggleHideCompleted,
    visibleItems: computedValues.visibleItems,
  };
};
