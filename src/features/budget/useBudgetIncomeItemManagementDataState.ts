import { useState } from "react";
import type { BudgetIncomeItem } from "@/types/routine";
import { getBudgetIncomeItems, saveBudgetIncomeItems } from "./storage";
import {
  createBudgetIncomeItemAndPersist,
  deleteBudgetIncomeItemAndPersist,
  renameBudgetIncomeItemAndPersist,
  updateBudgetIncomeItemAmountAndPersist,
} from "./budgetIncomeItemCrudPersistActions";
import { parsePositiveAmount } from "./budgetPageStateHelpers";
import texts from "./locales/ja.json";

type UseBudgetIncomeItemManagementDataStateParams = {
  nameInput: string;
  amountInput: string;
  closeForm: () => void;
};

/** 収入項目一覧のstateと作成・名前変更・金額変更・削除ハンドラをまとめて提供する。 */
export const useBudgetIncomeItemManagementDataState = ({
  nameInput,
  amountInput,
  closeForm,
}: UseBudgetIncomeItemManagementDataStateParams) => {
  const [items, setItems] = useState<BudgetIncomeItem[]>(() =>
    getBudgetIncomeItems(),
  );

  const persist = (nextItems: BudgetIncomeItem[]) => {
    setItems(nextItems);
    saveBudgetIncomeItems(nextItems);
  };

  const handleCreate = () => {
    const amount = parsePositiveAmount(amountInput);
    if (amount === null) return;

    const nextItems = createBudgetIncomeItemAndPersist({
      items,
      nameInput,
      amount,
      persist,
    });

    if (!nextItems) return;
    closeForm();
  };

  const handleRename = (itemId: string, name: string) => {
    renameBudgetIncomeItemAndPersist({ items, itemId, name, persist });
  };

  const handleUpdateAmount = (itemId: string, amount: number) => {
    updateBudgetIncomeItemAmountAndPersist({ items, itemId, amount, persist });
  };

  const handleDelete = (item: BudgetIncomeItem) => {
    deleteBudgetIncomeItemAndPersist({
      items,
      item,
      message: texts.allowanceSettings.deleteConfirm.replace(
        "{name}",
        () => item.name,
      ),
      persist,
    });
  };

  return {
    items,
    handleCreate,
    handleRename,
    handleUpdateAmount,
    handleDelete,
  };
};
