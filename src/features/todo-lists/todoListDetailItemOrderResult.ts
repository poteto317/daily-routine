type CreateTodoListDetailItemOrderResultParams = {
  moveCompletedToBottom: boolean;
  toggleMoveCompletedToBottom: () => void;
};

export const createTodoListDetailItemOrderResult = ({
  moveCompletedToBottom,
  toggleMoveCompletedToBottom,
}: CreateTodoListDetailItemOrderResultParams) => ({
  moveCompletedToBottom,
  toggleMoveCompletedToBottom,
});
