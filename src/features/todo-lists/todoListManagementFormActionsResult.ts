type CreateTodoListManagementFormActionsResultParams = {
  closeForm: () => void;
  openForm: () => void;
};

export const createTodoListManagementFormActionsResult = ({
  closeForm,
  openForm,
}: CreateTodoListManagementFormActionsResultParams) => {
  return {
    closeForm,
    openForm,
  };
};
