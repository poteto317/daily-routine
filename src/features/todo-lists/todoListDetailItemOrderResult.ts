import type { useTodoListMoveCompletedToBottomActions } from "./useTodoListMoveCompletedToBottomActions";
import type { useTodoListMoveCompletedToBottomState } from "./useTodoListMoveCompletedToBottomState";

type TodoListMoveCompletedToBottomState = ReturnType<
  typeof useTodoListMoveCompletedToBottomState
>;
type TodoListMoveCompletedToBottomActions = ReturnType<
  typeof useTodoListMoveCompletedToBottomActions
>;

type CreateTodoListDetailItemOrderResultParams = {
  moveCompletedToBottomState: TodoListMoveCompletedToBottomState;
  moveCompletedToBottomActions: TodoListMoveCompletedToBottomActions;
};

export const createTodoListDetailItemOrderResult = ({
  moveCompletedToBottomState,
  moveCompletedToBottomActions,
}: CreateTodoListDetailItemOrderResultParams) => ({
  moveCompletedToBottom: moveCompletedToBottomState.moveCompletedToBottom,
  toggleMoveCompletedToBottom:
    moveCompletedToBottomActions.toggleMoveCompletedToBottom,
});
