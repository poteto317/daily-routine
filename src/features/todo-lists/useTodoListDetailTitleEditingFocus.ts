import type { RefObject } from "react";
import { useEffect } from "react";

type UseTodoListDetailTitleEditingFocusParams = {
  editingListTitle: boolean;
  listTitleInputRef: RefObject<HTMLInputElement | null>;
};

export const useTodoListDetailTitleEditingFocus = ({
  editingListTitle,
  listTitleInputRef,
}: UseTodoListDetailTitleEditingFocusParams) => {
  useEffect(() => {
    if (!editingListTitle) return;
    setTimeout(() => listTitleInputRef.current?.focus(), 0);
  }, [editingListTitle, listTitleInputRef]);
};
