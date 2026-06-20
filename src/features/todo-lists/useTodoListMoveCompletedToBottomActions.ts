import { useMemo, type Dispatch, type SetStateAction } from "react";
import { createMoveCompletedToBottomToggleHandler } from "./todoListMoveCompletedToBottomHandler";
import { createTodoListMoveCompletedToBottomActionsResult } from "./todoListMoveCompletedToBottomActionsResult";

type UseTodoListMoveCompletedToBottomActionsParams = {
  setMoveCompletedToBottom: Dispatch<SetStateAction<boolean>>;
};

export const useTodoListMoveCompletedToBottomActions = ({
  setMoveCompletedToBottom,
}: UseTodoListMoveCompletedToBottomActionsParams) => {
  const toggleMoveCompletedToBottom = useMemo(
    () => createMoveCompletedToBottomToggleHandler(setMoveCompletedToBottom),
    [setMoveCompletedToBottom],
  );

  return createTodoListMoveCompletedToBottomActionsResult({
    toggleMoveCompletedToBottom,
  });
};
