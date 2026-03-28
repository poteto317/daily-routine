type FormActions = ReturnType<
  typeof import("./useTodoListManagementFormActions").useTodoListManagementFormActions
>;
type FormViewState = ReturnType<
  typeof import("./useTodoListManagementFormViewState").useTodoListManagementFormViewState
>;

type CreateTodoListManagementFormStateResultArgs = {
  closeForm: FormActions["closeForm"];
  formState: FormViewState;
  openForm: FormActions["openForm"];
};

export const createTodoListManagementFormStateResult = ({
  closeForm,
  formState,
  openForm,
}: CreateTodoListManagementFormStateResultArgs) => ({
  closeForm,
  inputRef: formState.inputRef,
  openForm,
  setTitleInput: formState.setTitleInput,
  showForm: formState.showForm,
  titleInput: formState.titleInput,
});
