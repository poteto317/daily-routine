import { useCallback, useState } from "react";
import type { BudgetIncomeItem } from "@/types/routine";

/** 収入項目1件のインライン編集状態（対象IDと名前・金額の入力値）を管理する。 */
export const useBudgetIncomeItemEditState = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemAmount, setEditingItemAmount] = useState("");

  const startEditItem = useCallback((item: BudgetIncomeItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setEditingItemAmount(String(item.amount));
  }, []);

  const cancelEditItem = useCallback(() => {
    setEditingItemId(null);
  }, []);

  return {
    editingItemId,
    editingItemName,
    editingItemAmount,
    setEditingItemName,
    setEditingItemAmount,
    startEditItem,
    cancelEditItem,
  };
};
