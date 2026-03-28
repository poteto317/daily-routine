import { useTodoListManagementFormFocus } from "./useTodoListManagementFormFocus";
import { useTodoListManagementFormState } from "./useTodoListManagementFormState";
import { useTodoListManagementDataState } from "./useTodoListManagementDataState";
import { createTodoListManagementPageStateResult } from "./todoListManagementPageStateResult";
import { createTodoListManagementTitleEditingBindings } from "./todoListManagementTitleEditingBindings";
import { useTodoListManagementTitleEditing } from "./useTodoListManagementTitleEditing";

type UseTodoListManagementPageStateParams = {
  navigate: (page: "todo-lists") => void;
};

export const useTodoListManagementPageState = ({
  navigate,
}: UseTodoListManagementPageStateParams) => {
  const { closeForm, inputRef, openForm, setTitleInput, showForm, titleInput } =
    useTodoListManagementFormState();
  const dataState = useTodoListManagementDataState({
    titleInput,
    closeForm,
    navigate,
  });
  const titleEditing = useTodoListManagementTitleEditing(
    createTodoListManagementTitleEditingBindings({
      handleRename: dataState.handleRename,
    }),
  );

  useTodoListManagementFormFocus({ inputRef, showForm });

  return createTodoListManagementPageStateResult({
    inputRef,
    lists: dataState.lists,
    showForm,
    titleInput,
    closeForm,
    handleCreate: dataState.handleCreate,
    handleDelete: dataState.handleDelete,
    handleToggleVisibility: dataState.handleToggleVisibility,
    openForm,
    openList: dataState.openList,
    setTitleInput,
    cancelEditListTitle: titleEditing.cancelEditListTitle,
    commitEditListTitle: titleEditing.commitEditListTitle,
    editingListId: titleEditing.editingListId,
    editingListTitleValue: titleEditing.editingListTitleValue,
    setEditingListTitleValue: titleEditing.setEditingListTitleValue,
    startEditListTitle: titleEditing.startEditListTitle,
  });
};
