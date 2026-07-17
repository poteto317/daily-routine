import { useRef, useState } from "react";
import type { BudgetExpenseItemKind } from "@/types/routine";

/** 支出項目作成フォームの表示/非表示・入力値・フォーカス対象inputを管理する。 */
export const useBudgetExpenseItemManagementFormState = () => {
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [kindInput, setKindInput] = useState<BudgetExpenseItemKind>("fixed");
  const inputRef = useRef<HTMLInputElement>(null);

  const openForm = (initialKind: BudgetExpenseItemKind) => {
    setKindInput(initialKind);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setNameInput("");
    setAmountInput("");
  };

  return {
    inputRef,
    nameInput,
    amountInput,
    kindInput,
    showForm,
    setNameInput,
    setAmountInput,
    setKindInput,
    openForm,
    closeForm,
  };
};
