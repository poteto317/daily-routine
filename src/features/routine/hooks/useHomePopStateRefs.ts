import type { PageType } from "@/features/routine/pages/types";
import { useHomePopStateRefSync } from "./useHomePopStateRefSync";
import { useHomePopStateRefValues } from "./useHomePopStateRefValues";

type UseHomePopStateRefsParams = {
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: (page: PageType) => void;
};

export const useHomePopStateRefs = ({
  showForm,
  closeFormAction,
  setCurrentPageAction,
}: UseHomePopStateRefsParams) => {
  const refs = useHomePopStateRefValues({
    showForm,
    closeFormAction,
    setCurrentPageAction,
  });

  useHomePopStateRefSync({
    showForm,
    closeFormAction,
    setCurrentPageAction,
    refs,
  });

  return refs;
};
