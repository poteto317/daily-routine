import { useRef, useState } from "react";

export const useTodoListDetailTitleEditingValueState = () => {
  const [editingListTitle, setEditingListTitle] = useState(false);
  const [editingListTitleValue, setEditingListTitleValue] = useState("");
  const listTitleInputRef = useRef<HTMLInputElement>(null);

  return {
    editingListTitle,
    editingListTitleValue,
    listTitleInputRef,
    setEditingListTitle,
    setEditingListTitleValue,
  };
};
