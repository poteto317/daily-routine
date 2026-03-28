type CreateTodoListSelectedIdValueResultParams = {
  effectiveSelectedId: string | null;
  selectedId: string | null;
};

export const createTodoListSelectedIdValueResult = ({
  effectiveSelectedId,
  selectedId,
}: CreateTodoListSelectedIdValueResultParams) => {
  return {
    effectiveSelectedId,
    selectedId,
  };
};
