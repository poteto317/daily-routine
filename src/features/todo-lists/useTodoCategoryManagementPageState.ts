import { useTodoCategoryManagementFormState } from "./useTodoCategoryManagementFormState";
import { useTodoCategoryManagementFormFocus } from "./useTodoCategoryManagementFormFocus";
import { useTodoCategoryManagementDataState } from "./useTodoCategoryManagementDataState";
import { useTodoCategoryManagementNameEditing } from "./useTodoCategoryManagementNameEditing";
import { useTodoCategoryDragAndDrop } from "./useTodoCategoryDragAndDrop";
import { useColorPickerController } from "./useColorPickerController";

export const useTodoCategoryManagementPageState = () => {
  const {
    inputRef,
    nameInput,
    colorInput,
    showForm,
    setNameInput,
    setColorInput,
    openForm,
    closeForm,
  } = useTodoCategoryManagementFormState();

  const {
    categories,
    handleCreate,
    handleRename,
    handleUpdateColor,
    handleDelete,
    handleReorderCategories,
  } = useTodoCategoryManagementDataState({ nameInput, colorInput, closeForm });

  const dnd = useTodoCategoryDragAndDrop({
    categories,
    onReorderCategories: handleReorderCategories,
  });

  const {
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
  } = useTodoCategoryManagementNameEditing({ handleRename });

  // 各カテゴリ行の色編集ポップオーバーの開閉状態管理は、Todo詳細画面の
  // アイテム色ピッカーと同じ useColorPickerController を再利用する
  // （排他制御・外側クリック/Escでの自動クローズを流用するため）。
  // 一括ピッカー相当の機能はこの画面では使わない。
  const {
    colorPickerItemId: colorEditingCategoryId,
    toggleItemColorPicker: toggleCategoryColorPicker,
    closeItemColorPicker: closeCategoryColorPicker,
  } = useColorPickerController();

  useTodoCategoryManagementFormFocus({ inputRef, showForm });

  return {
    categories,
    inputRef,
    nameInput,
    colorInput,
    showForm,
    setNameInput,
    setColorInput,
    openForm,
    closeForm,
    handleCreate,
    handleUpdateColor,
    handleDelete,
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
    colorEditingCategoryId,
    toggleCategoryColorPicker,
    closeCategoryColorPicker,
    dnd,
  };
};
