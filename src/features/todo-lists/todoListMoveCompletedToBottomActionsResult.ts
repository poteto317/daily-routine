type TodoListMoveCompletedToBottomActionsResultInput = {
  toggleMoveCompletedToBottom: () => void;
};

export const createTodoListMoveCompletedToBottomActionsResult = ({
  toggleMoveCompletedToBottom,
}: TodoListMoveCompletedToBottomActionsResultInput) => ({
  toggleMoveCompletedToBottom,
});
