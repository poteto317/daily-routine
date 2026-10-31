import { useState } from "react";
import type { BudgetIncomeItem } from "@/types/routine";
import { getBudgetIncomeItems, saveBudgetIncomeItems } from "./storage";
import {
  createBudgetIncomeItemAndPersist,
  deleteBudgetIncomeItemAndPersist,
  updateBudgetIncomeItemAndPersist,
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

  /** 画面の外でストレージが書き換わったときに一覧を読み直す。 */
  const reloadItems = () => setItems(getBudgetIncomeItems());

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

  const handleUpdateItem = (itemId: string, name: string, amount: number) => {
    updateBudgetIncomeItemAndPersist({ items, itemId, name, amount, persist });
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
    handleUpdateItem,
    handleDelete,
    reloadItems,
  };
};
