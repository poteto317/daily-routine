type TodoListManagementTitleEditingBindingsArgs = {
  handleRename: (listId: string, title: string) => void;
};

export const createTodoListManagementTitleEditingBindings = ({
  handleRename,
}: TodoListManagementTitleEditingBindingsArgs) => {
  return {
    handleRename,
  };
};
