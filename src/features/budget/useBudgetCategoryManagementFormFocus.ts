import { useEffect } from "react";
import type { RefObject } from "react";

type UseBudgetCategoryManagementFormFocusParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  showForm: boolean;
};

/** 作成フォームを開いたときに入力欄へ自動フォーカスする。 */
export const useBudgetCategoryManagementFormFocus = ({
  inputRef,
  showForm,
}: UseBudgetCategoryManagementFormFocusParams) => {
  useEffect(() => {
    if (!showForm) return;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputRef, showForm]);
};
