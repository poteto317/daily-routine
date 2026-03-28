import { setSelectedTodoListId } from "./selectedTodoList";
import { createTodoListManagementActionHandlersResult } from "./todoListManagementActionHandlersResult";
import {
  createTodoListCreateHandler,
  createTodoListDeleteHandler,
  createTodoListRenameHandler,
  createTodoListVisibilityToggleHandler,
} from "./todoListManagementMutationHandlers";
import { createManagedTodoListsPersistAction } from "./todoListManagementPersistActions";
import type { TodoList } from "./types";
import texts from "./locales/ja.json";

type UseTodoListManagementActionHandlersParams = {
  lists: TodoList[];
  titleInput: string;
  setLists: (value: TodoList[]) => void;
  closeForm: () => void;
  navigate: (page: "todo-lists") => void;
};

export const useTodoListManagementActionHandlers = ({
  lists,
  titleInput,
  setLists,
  closeForm,
  navigate,
}: UseTodoListManagementActionHandlersParams) => {
  const persist = createManagedTodoListsPersistAction({ setLists });

  const handleCreate = createTodoListCreateHandler({
    lists,
    titleInput,
    persist,
    closeForm,
  });

  const handleToggleVisibility = createTodoListVisibilityToggleHandler({
    lists,
    persist,
  });

  const handleDelete = createTodoListDeleteHandler({
    lists,
    persist,
    buildDeleteMessage: (list) =>
      texts.management.deleteConfirm.replace("{title}", list.title),
  });

  const handleRename = createTodoListRenameHandler({ lists, persist });

  const openList = (listId: string) => {
    setSelectedTodoListId(listId);
    navigate("todo-lists");
  };

  return createTodoListManagementActionHandlersResult({
    handleCreate,
    handleDelete,
    handleRename,
    handleToggleVisibility,
    openList,
  });
};
