import { useCallback, useState } from "react";

type UseCategoryNameEditingParams = {
  handleRename: (categoryId: string, name: string) => void;
};

/** カテゴリ名のインライン編集状態を管理する。 */
export const useCategoryNameEditing = ({
  handleRename,
}: UseCategoryNameEditingParams) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryNameValue, setEditingCategoryNameValue] = useState("");

  const startEditCategoryName = useCallback(
    (categoryId: string, currentName: string) => {
      setEditingCategoryId(categoryId);
      setEditingCategoryNameValue(currentName);
    },
    [],
  );

  const commitEditCategoryName = useCallback(() => {
    if (editingCategoryId) {
      handleRename(editingCategoryId, editingCategoryNameValue);
    }
    setEditingCategoryId(null);
  }, [editingCategoryId, editingCategoryNameValue, handleRename]);

  const cancelEditCategoryName = useCallback(() => {
    setEditingCategoryId(null);
  }, []);

  return {
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
  };
};
