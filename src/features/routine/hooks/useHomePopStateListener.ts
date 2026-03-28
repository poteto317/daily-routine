import { useEffect } from "react";
import {
  resolvePageFromHistoryState,
  saveCurrentPage,
} from "./pageStatePersistence";
import { handleHomePopState } from "./homePopStateActions";
import type { PageType } from "@/features/routine/pages/types";

type HomePopStateRefs = {
  showFormRef: { current: boolean };
  closeFormActionRef: { current: () => void };
  setCurrentPageActionRef: { current: (page: PageType) => void };
};

export const useHomePopStateListener = (refs: HomePopStateRefs) => {
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      handleHomePopState({
        state: event.state,
        refs,
        resolvePageFromHistoryState,
        saveCurrentPage,
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [refs]);
};
