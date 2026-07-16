import { useState } from "react";
import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { getTodoCategories, saveTodoCategories } from "./storage";
import {
  createTodoCategoryAndPersist,
  deleteTodoCategoryAndPersist,
  renameTodoCategoryAndPersist,
  updateTodoCategoryColorAndPersist,
} from "./todoCategoryCrudPersistActions";
import texts from "./locales/ja.json";

type UseTodoCategoryManagementDataStateParams = {
  nameInput: string;
  colorInput: TodoItemBgColorValue | undefined;
  closeForm: () => void;
};

/** カテゴリ一覧のstateと作成・名前変更・色変更・削除ハンドラをまとめて提供する。 */
export const useTodoCategoryManagementDataState = ({
  nameInput,
  colorInput,
  closeForm,
}: UseTodoCategoryManagementDataStateParams) => {
  const [categories, setCategories] = useState<TodoCategory[]>(() =>
    getTodoCategories(),
  );

  const persist = (nextCategories: TodoCategory[]) => {
    setCategories(nextCategories);
    saveTodoCategories(nextCategories);
  };

  const handleCreate = () => {
    const nextCategories = createTodoCategoryAndPersist({
      categories,
      nameInput,
      color: colorInput,
      persist,
    });

    if (!nextCategories) return;
    closeForm();
  };

  const handleRename = (categoryId: string, name: string) => {
    renameTodoCategoryAndPersist({ categories, categoryId, name, persist });
  };

  const handleUpdateColor = (
    categoryId: string,
    color: TodoItemBgColorValue | undefined,
  ) => {
    updateTodoCategoryColorAndPersist({ categories, categoryId, color, persist });
  };

  const handleDelete = (category: TodoCategory) => {
    deleteTodoCategoryAndPersist({
      categories,
      category,
      message: texts.categoryManagement.deleteConfirm.replace(
        "{name}",
        () => category.name,
      ),
      persist,
    });
  };

  return {
    categories,
    handleCreate,
    handleRename,
    handleUpdateColor,
    handleDelete,
  };
};
