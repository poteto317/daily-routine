import type { PageType } from "@/features/routine/pages/types";
import { useHomePopStateListener } from "./useHomePopStateListener";
import { useHomePopStateRefs } from "./useHomePopStateRefs";

type UseHomePopStateParams = {
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: (page: PageType) => void;
};

export const useHomePopState = ({
  showForm,
  closeFormAction,
  setCurrentPageAction,
}: UseHomePopStateParams) => {
  const refs = useHomePopStateRefs({
    showForm,
    closeFormAction,
    setCurrentPageAction,
  });

  useHomePopStateListener(refs);
};
