import { useState } from "react";
import type { BudgetExpenseItem, BudgetExpenseItemKind } from "@/types/routine";
import { getBudgetExpenseItems, saveBudgetExpenseItems } from "./storage";
import {
  createBudgetExpenseItemAndPersist,
  deleteBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemKindAndPersist,
} from "./budgetExpenseItemCrudPersistActions";
import { parsePositiveAmount } from "./budgetPageStateHelpers";
import texts from "./locales/ja.json";

type UseBudgetExpenseItemManagementDataStateParams = {
  nameInput: string;
  amountInput: string;
  kindInput: BudgetExpenseItemKind;
  closeForm: () => void;
};

/** 支出項目一覧のstateと作成・名前変更・金額変更・分類変更・削除ハンドラをまとめて提供する。 */
export const useBudgetExpenseItemManagementDataState = ({
  nameInput,
  amountInput,
  kindInput,
  closeForm,
}: UseBudgetExpenseItemManagementDataStateParams) => {
  const [items, setItems] = useState<BudgetExpenseItem[]>(() =>
    getBudgetExpenseItems(),
  );

  const persist = (nextItems: BudgetExpenseItem[]) => {
    setItems(nextItems);
    saveBudgetExpenseItems(nextItems);
  };

  /** 画面の外でストレージが書き換わったときに一覧を読み直す。 */
  const reloadItems = () => setItems(getBudgetExpenseItems());

  const handleCreate = () => {
    const amount = parsePositiveAmount(amountInput);
    if (amount === null) return;

    const nextItems = createBudgetExpenseItemAndPersist({
      items,
      nameInput,
      amount,
      kind: kindInput,
      persist,
    });

    if (!nextItems) return;
    closeForm();
  };

  const handleUpdateItem = (itemId: string, name: string, amount: number) => {
    updateBudgetExpenseItemAndPersist({ items, itemId, name, amount, persist });
  };

  const handleUpdateKind = (itemId: string, kind: BudgetExpenseItemKind) => {
    updateBudgetExpenseItemKindAndPersist({ items, itemId, kind, persist });
  };

  /** 指定した項目の分類（固定費/変動費）を反転させる。 */
  const toggleItemKind = (itemId: string) => {
    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem) return;

    handleUpdateKind(
      itemId,
      currentItem.kind === "fixed" ? "variable" : "fixed",
    );
  };

  const handleDelete = (item: BudgetExpenseItem) => {
    deleteBudgetExpenseItemAndPersist({
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
    handleUpdateKind,
    toggleItemKind,
    handleDelete,
    reloadItems,
  };
};
