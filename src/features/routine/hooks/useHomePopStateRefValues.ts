import { useRef } from "react";
import type { PageType } from "@/features/routine/pages/types";

type UseHomePopStateRefValuesParams = {
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: (page: PageType) => void;
};

export const useHomePopStateRefValues = ({
  showForm,
  closeFormAction,
  setCurrentPageAction,
}: UseHomePopStateRefValuesParams) => {
  const showFormRef = useRef(showForm);
  const closeFormActionRef = useRef(closeFormAction);
  const setCurrentPageActionRef = useRef(setCurrentPageAction);

  return {
    closeFormActionRef,
    setCurrentPageActionRef,
    showFormRef,
  };
};
