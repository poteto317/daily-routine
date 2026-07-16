import { useEffect } from "react";
import type { RefObject } from "react";

type UseTodoCategoryManagementFormFocusParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  showForm: boolean;
};

/** 作成フォームを開いたときに入力欄へ自動フォーカスする。 */
export const useTodoCategoryManagementFormFocus = ({
  inputRef,
  showForm,
}: UseTodoCategoryManagementFormFocusParams) => {
  useEffect(() => {
    if (!showForm) return;
    const timerId = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timerId);
  }, [inputRef, showForm]);
};
