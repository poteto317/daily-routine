type TodoListDetailProgressResultInput = {
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
};

export const createTodoListDetailProgressResult = ({
  progress,
}: TodoListDetailProgressResultInput) => ({
  progress,
});
