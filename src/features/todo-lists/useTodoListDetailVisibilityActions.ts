import { useMemo, type Dispatch, type SetStateAction } from "react";
import { createCompletedVisibilityToggleHandler } from "./todoListPageViewActions";
import { createTodoListDetailVisibilityActionsResult } from "./todoListDetailVisibilityActionsResult";

type UseTodoListDetailVisibilityActionsParams = {
  setHideCompleted: Dispatch<SetStateAction<boolean>>;
};

export const useTodoListDetailVisibilityActions = ({
  setHideCompleted,
}: UseTodoListDetailVisibilityActionsParams) => {
  const toggleHideCompleted = useMemo(
    () => createCompletedVisibilityToggleHandler(setHideCompleted),
    [setHideCompleted],
  );

  return createTodoListDetailVisibilityActionsResult({
    toggleHideCompleted,
  });
};
