type TodoListFormState = {
  showForm: boolean;
  titleInput: string;
};

export const createClosedTodoListFormState = (): TodoListFormState => ({
  showForm: false,
  titleInput: "",
});

export const shouldFocusTodoListForm = (showForm: boolean): boolean => showForm;

export type { TodoListFormState };
