type CreateTodoListDetailVisibilityActionsResultParams = {
  toggleHideCompleted: () => void;
};

export const createTodoListDetailVisibilityActionsResult = ({
  toggleHideCompleted,
}: CreateTodoListDetailVisibilityActionsResultParams) => {
  return {
    toggleHideCompleted,
  };
};
