import { createTodoListManagementFormStateResult } from "./todoListManagementFormStateResult";
import { useTodoListManagementFormActions } from "./useTodoListManagementFormActions";
import { useTodoListManagementFormViewState } from "./useTodoListManagementFormViewState";

export const useTodoListManagementFormState = () => {
  const formState = useTodoListManagementFormViewState();
  const { closeForm, openForm } = useTodoListManagementFormActions({
    setShowForm: formState.setShowForm,
    setTitleInput: formState.setTitleInput,
  });

  return createTodoListManagementFormStateResult({
    closeForm,
    formState,
    openForm,
  });
};
