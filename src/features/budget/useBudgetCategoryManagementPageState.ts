import { useBudgetCategoryManagementFormState } from "./useBudgetCategoryManagementFormState";
import { useFormOpenAutoFocus } from "@/hooks/useFormOpenAutoFocus";
import { useBudgetCategoryManagementDataState } from "./useBudgetCategoryManagementDataState";
import { useCategoryNameEditing } from "@/hooks/useCategoryNameEditing";

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
  } = useCategoryNameEditing({ handleRename });

  useFormOpenAutoFocus({ inputRef, showForm });

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
