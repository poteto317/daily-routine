import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PageType } from "../pages/types";
import { createPageNavigationActionsResult } from "./pageNavigationActionsResult";
import { pushCurrentPageHistory } from "./pageStatePersistence";
import { applyPageChangeAction } from "./pageNavigationStateActions";

type SetPage = Dispatch<SetStateAction<PageType>>;

export const usePageNavigationActions = (setCurrentPage: SetPage) => {
  const onPageChangeAction = useCallback(
    (page: PageType) => {
      applyPageChangeAction({
        page,
        pushCurrentPageHistory,
        setCurrentPage,
      });
    },
    [setCurrentPage],
  );

  return createPageNavigationActionsResult({ onPageChangeAction });
};
