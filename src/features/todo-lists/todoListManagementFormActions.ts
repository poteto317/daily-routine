import { createClosedTodoListFormState } from "./todoListManagementFormState";

type SetValue<T> = (value: T) => void;

export const createTodoListFormCloseAction = (params: {
  setShowForm: SetValue<boolean>;
  setTitleInput: SetValue<string>;
}) => {
  const { setShowForm, setTitleInput } = params;

  return () => {
    const nextFormState = createClosedTodoListFormState();
    setTitleInput(nextFormState.titleInput);
    setShowForm(nextFormState.showForm);
  };
};

export const createTodoListFormOpenAction = (params: {
  setShowForm: SetValue<boolean>;
}) => {
  const { setShowForm } = params;

  return () => {
    setShowForm(true);
  };
};
