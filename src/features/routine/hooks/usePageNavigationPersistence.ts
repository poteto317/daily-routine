import { useEffect } from "react";
import type { PageType } from "../pages/types";
import {
  replaceCurrentPageHistory,
  saveCurrentPage,
} from "./pageStatePersistence";
import { syncCurrentPageState } from "./pageNavigationStateActions";

export const usePageNavigationPersistence = (currentPage: PageType) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      syncCurrentPageState({
        currentPage,
        saveCurrentPage,
        replaceCurrentPageHistory,
      });
    }
  }, [currentPage]);
};
