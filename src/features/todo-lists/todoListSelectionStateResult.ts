type CreateTodoListSelectionStateResultParams = {
  effectiveSelectedId: string | null;
};

export const createTodoListSelectionStateResult = ({
  effectiveSelectedId,
}: CreateTodoListSelectionStateResultParams) => {
  return {
    effectiveSelectedId,
  };
};
