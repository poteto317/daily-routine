import type { Dispatch, SetStateAction } from "react";
import {
  createTodoListFormCloseAction,
  createTodoListFormOpenAction,
} from "./todoListManagementFormActions";
import { createTodoListManagementFormActionsResult } from "./todoListManagementFormActionsResult";

type UseTodoListManagementFormActionsArgs = {
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setTitleInput: Dispatch<SetStateAction<string>>;
};

export const useTodoListManagementFormActions = ({
  setShowForm,
  setTitleInput,
}: UseTodoListManagementFormActionsArgs) => {
  return createTodoListManagementFormActionsResult({
    closeForm: createTodoListFormCloseAction({
      setShowForm,
      setTitleInput,
    }),
    openForm: createTodoListFormOpenAction({ setShowForm }),
  });
};
