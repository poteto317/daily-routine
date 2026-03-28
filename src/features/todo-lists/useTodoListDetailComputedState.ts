import type { TodoList } from "./types";
import { createTodoListDetailComputedStateResult } from "./todoListDetailComputedStateResult";
import { useTodoListDetailComputedValues } from "./useTodoListDetailComputedValues";
import { useTodoListDetailVisibilityActions } from "./useTodoListDetailVisibilityActions";
import { useTodoListDetailVisibilityState } from "./useTodoListDetailVisibilityState";

type UseTodoListDetailComputedStateParams = {
  list: TodoList;
};

export const useTodoListDetailComputedState = ({
  list,
}: UseTodoListDetailComputedStateParams) => {
  const visibilityState = useTodoListDetailVisibilityState();
  const computedValues = useTodoListDetailComputedValues({
    hideCompleted: visibilityState.hideCompleted,
    list,
  });
  const visibilityActions = useTodoListDetailVisibilityActions({
    setHideCompleted: visibilityState.setHideCompleted,
  });

  return createTodoListDetailComputedStateResult({
    computedValues,
    visibilityActions,
    visibilityState,
  });
};
