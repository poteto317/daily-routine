import type { RefObject } from "react";
import { useEffect } from "react";
import { shouldFocusTodoListForm } from "./managementPageStateActions";

type UseTodoListManagementFormFocusParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  showForm: boolean;
};

export const useTodoListManagementFormFocus = ({
  inputRef,
  showForm,
}: UseTodoListManagementFormFocusParams) => {
  useEffect(() => {
    if (!shouldFocusTodoListForm(showForm)) return;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputRef, showForm]);
};
