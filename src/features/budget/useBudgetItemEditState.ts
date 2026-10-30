import { useCallback, useState } from "react";

type EditableBudgetItem = { id: string; name: string; amount: number };

/** 収入・支出項目1件のインライン編集状態（対象IDと名前・金額の入力値）を管理する。 */
export const useBudgetItemEditState = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemAmount, setEditingItemAmount] = useState("");

  const startEditItem = useCallback((item: EditableBudgetItem) => {
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
