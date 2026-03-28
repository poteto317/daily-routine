import { useState } from "react";
import { getTodoLists } from "./storage";
import { createTodoListManagementDataStateResult } from "./todoListManagementDataStateResult";
import type { TodoList } from "./types";
import { useTodoListManagementActionHandlers } from "./useTodoListManagementActionHandlers";

type UseTodoListManagementDataStateParams = {
  titleInput: string;
  closeForm: () => void;
  navigate: (page: "todo-lists") => void;
};

export const useTodoListManagementDataState = ({
  titleInput,
  closeForm,
  navigate,
}: UseTodoListManagementDataStateParams) => {
  const [lists, setLists] = useState<TodoList[]>(() => getTodoLists());
  const actionHandlers = useTodoListManagementActionHandlers({
    lists,
    titleInput,
    setLists,
    closeForm,
    navigate,
  });

  return createTodoListManagementDataStateResult({
    actionHandlers,
    lists,
  });
};
