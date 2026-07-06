import { useRef, useState } from "react";

/** カテゴリ作成フォームの表示/非表示・入力値・フォーカス対象inputを管理する。 */
export const useBudgetCategoryManagementFormState = () => {
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setNameInput("");
  };

  return {
    inputRef,
    nameInput,
    showForm,
    setNameInput,
    openForm,
    closeForm,
  };
};
