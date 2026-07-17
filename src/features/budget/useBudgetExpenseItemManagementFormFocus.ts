import { useEffect } from "react";
import type { RefObject } from "react";

type UseBudgetExpenseItemManagementFormFocusParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  showForm: boolean;
};

/** 作成フォームを開いたときに入力欄へ自動フォーカスする。 */
export const useBudgetExpenseItemManagementFormFocus = ({
  inputRef,
  showForm,
}: UseBudgetExpenseItemManagementFormFocusParams) => {
  useEffect(() => {
    if (!showForm) return;
    const timerId = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timerId);
  }, [inputRef, showForm]);
};
