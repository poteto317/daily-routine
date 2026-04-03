type TodoListHideCompletedActionsResultInput = {
  toggleHideCompleted: () => void;
};

export const createTodoListHideCompletedActionsResult = ({
  toggleHideCompleted,
}: TodoListHideCompletedActionsResultInput) => ({
  toggleHideCompleted,
});
