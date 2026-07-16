import { useRef, useState } from "react";
import type { TodoItemBgColorValue } from "./todoItemBgColor";

/** カテゴリ作成フォームの表示/非表示・入力値・フォーカス対象inputを管理する。 */
export const useTodoCategoryManagementFormState = () => {
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [colorInput, setColorInput] = useState<
    TodoItemBgColorValue | undefined
  >(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setNameInput("");
    setColorInput(undefined);
  };

  return {
    inputRef,
    nameInput,
    colorInput,
    showForm,
    setNameInput,
    setColorInput,
    openForm,
    closeForm,
  };
};
