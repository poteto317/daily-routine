import type { TodoList } from "./types";

type CreateTodoListManagementActionHandlersResultParams = {
  handleCreate: () => void;
  handleDelete: (list: TodoList) => void;
  handleRename: (listId: string, title: string) => void;
  handleToggleVisibility: (list: TodoList) => void;
  openList: (listId: string) => void;
};

export const createTodoListManagementActionHandlersResult = ({
  handleCreate,
  handleDelete,
  handleRename,
  handleToggleVisibility,
  openList,
}: CreateTodoListManagementActionHandlersResultParams) => {
  return {
    handleCreate,
    handleDelete,
    handleRename,
    handleToggleVisibility,
    openList,
  };
};
