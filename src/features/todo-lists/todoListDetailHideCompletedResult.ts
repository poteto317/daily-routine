type CreateTodoListDetailHideCompletedResultParams = {
  hideCompleted: boolean;
  toggleHideCompleted: () => void;
};

export const createTodoListDetailHideCompletedResult = ({
  hideCompleted,
  toggleHideCompleted,
}: CreateTodoListDetailHideCompletedResultParams) => ({
  hideCompleted,
  toggleHideCompleted,
});
