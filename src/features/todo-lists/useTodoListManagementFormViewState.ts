import { useRef, useState } from "react";

export const useTodoListManagementFormViewState = () => {
  const [showForm, setShowForm] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    inputRef,
    setShowForm,
    setTitleInput,
    showForm,
    titleInput,
  };
};
