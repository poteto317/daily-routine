import { useMemo, type Dispatch, type SetStateAction } from "react";
import { createCompletedVisibilityToggleHandler } from "./todoListHideCompletedHandler";
import { createTodoListHideCompletedActionsResult } from "./todoListHideCompletedActionsResult";

type UseTodoListHideCompletedActionsParams = {
  setHideCompleted: Dispatch<SetStateAction<boolean>>;
};

export const useTodoListHideCompletedActions = ({
  setHideCompleted,
}: UseTodoListHideCompletedActionsParams) => {
  const toggleHideCompleted = useMemo(
    () => createCompletedVisibilityToggleHandler(setHideCompleted),
    [setHideCompleted],
  );

  return createTodoListHideCompletedActionsResult({ toggleHideCompleted });
};
