import { useBudgetCategoryManagementFormState } from "./useBudgetCategoryManagementFormState";
import { useBudgetCategoryManagementFormFocus } from "./useBudgetCategoryManagementFormFocus";
import { useBudgetCategoryManagementDataState } from "./useBudgetCategoryManagementDataState";
import { useBudgetCategoryManagementNameEditing } from "./useBudgetCategoryManagementNameEditing";

export const useBudgetCategoryManagementPageState = () => {
  const { inputRef, nameInput, showForm, setNameInput, openForm, closeForm } =
    useBudgetCategoryManagementFormState();

  const { categories, handleCreate, handleRename, handleDelete } =
    useBudgetCategoryManagementDataState({ nameInput, closeForm });

  const {
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
  } = useBudgetCategoryManagementNameEditing({ handleRename });

  useBudgetCategoryManagementFormFocus({ inputRef, showForm });

  return {
    categories,
    inputRef,
    nameInput,
    showForm,
    setNameInput,
    openForm,
    closeForm,
    handleCreate,
    handleDelete,
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
  };
};
