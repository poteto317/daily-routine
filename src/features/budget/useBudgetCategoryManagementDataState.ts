import { useState } from "react";
import type { BudgetCategory } from "@/types/routine";
import { getBudgetCategories, saveBudgetCategories } from "./storage";
import {
  createBudgetCategoryAndPersist,
  deleteBudgetCategoryAndPersist,
  renameBudgetCategoryAndPersist,
} from "./budgetCategoryCrudPersistActions";
import texts from "./locales/ja.json";

type UseBudgetCategoryManagementDataStateParams = {
  nameInput: string;
  closeForm: () => void;
};

/** カテゴリ一覧のstateと作成・名前変更・削除ハンドラをまとめて提供する。 */
export const useBudgetCategoryManagementDataState = ({
  nameInput,
  closeForm,
}: UseBudgetCategoryManagementDataStateParams) => {
  const [categories, setCategories] = useState<BudgetCategory[]>(() =>
    getBudgetCategories(),
  );

  const persist = (nextCategories: BudgetCategory[]) => {
    setCategories(nextCategories);
    saveBudgetCategories(nextCategories);
  };

  const handleCreate = () => {
    const nextCategories = createBudgetCategoryAndPersist({
      categories,
      nameInput,
      persist,
    });

    if (!nextCategories) return;
    closeForm();
  };

  const handleRename = (categoryId: string, name: string) => {
    renameBudgetCategoryAndPersist({ categories, categoryId, name, persist });
  };

  const handleDelete = (category: BudgetCategory) => {
    deleteBudgetCategoryAndPersist({
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
    handleDelete,
  };
};
