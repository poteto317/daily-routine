import { useEffect } from "react";
import type { PageType } from "@/features/routine/pages/types";
import { syncHomePopStateRefs } from "./homePopStateActions";

type HomePopStateRefs = {
  showFormRef: { current: boolean };
  closeFormActionRef: { current: () => void };
  setCurrentPageActionRef: { current: (page: PageType) => void };
};

type UseHomePopStateRefSyncParams = {
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: (page: PageType) => void;
  refs: HomePopStateRefs;
};

export const useHomePopStateRefSync = ({
  showForm,
  closeFormAction,
  setCurrentPageAction,
  refs,
}: UseHomePopStateRefSyncParams) => {
  useEffect(() => {
    syncHomePopStateRefs({
      showForm,
      closeFormAction,
      setCurrentPageAction,
      refs,
    });
  }, [showForm, closeFormAction, setCurrentPageAction, refs]);
};
