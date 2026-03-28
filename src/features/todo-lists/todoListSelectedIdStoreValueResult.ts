type CreateTodoListSelectedIdStoreValueResultParams = {
  selectedId: string | null;
};

export const createTodoListSelectedIdStoreValueResult = ({
  selectedId,
}: CreateTodoListSelectedIdStoreValueResultParams) => {
  return {
    selectedId,
  };
};
