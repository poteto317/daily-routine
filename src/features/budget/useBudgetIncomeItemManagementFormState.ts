import { useRef, useState } from "react";

/** 収入項目作成フォームの表示/非表示・入力値・フォーカス対象inputを管理する。 */
export const useBudgetIncomeItemManagementFormState = () => {
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const openForm = () => {
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
    showForm,
    setNameInput,
    setAmountInput,
    openForm,
    closeForm,
  };
};
