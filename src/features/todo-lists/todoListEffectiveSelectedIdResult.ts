type CreateTodoListEffectiveSelectedIdResultParams = {
  effectiveSelectedId: string | null;
};

export const createTodoListEffectiveSelectedIdResult = ({
  effectiveSelectedId,
}: CreateTodoListEffectiveSelectedIdResultParams) => {
  return {
    effectiveSelectedId,
  };
};
