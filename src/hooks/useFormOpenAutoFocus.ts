import { useEffect } from "react";
import type { RefObject } from "react";

type UseFormOpenAutoFocusParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  showForm: boolean;
};

/** 作成フォームを開いたときに入力欄へ自動フォーカスする。 */
export const useFormOpenAutoFocus = ({
  inputRef,
  showForm,
}: UseFormOpenAutoFocusParams) => {
  useEffect(() => {
    if (!showForm) return;
    const timerId = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timerId);
  }, [inputRef, showForm]);
};
