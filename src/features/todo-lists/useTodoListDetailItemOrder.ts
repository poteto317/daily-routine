import { createTodoListDetailItemOrderResult } from "./todoListDetailItemOrderResult";
import { useTodoListMoveCompletedToBottomActions } from "./useTodoListMoveCompletedToBottomActions";
import { useTodoListMoveCompletedToBottomState } from "./useTodoListMoveCompletedToBottomState";

export const useTodoListDetailItemOrder = () => {
  const moveCompletedToBottomState = useTodoListMoveCompletedToBottomState();
  const moveCompletedToBottomActions = useTodoListMoveCompletedToBottomActions({
    setMoveCompletedToBottom:
      moveCompletedToBottomState.setMoveCompletedToBottom,
  });

  return createTodoListDetailItemOrderResult({
    moveCompletedToBottomState,
    moveCompletedToBottomActions,
  });
};
