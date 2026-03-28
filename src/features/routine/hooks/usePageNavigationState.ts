import { useState, useSyncExternalStore } from "react";
import type { PageType } from "../pages/types";
import { getInitialPage } from "./pageStatePersistence";
import { createPageNavigationStateResult } from "./pageNavigationStateResult";

export const usePageNavigationState = () => {
  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage);

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return createPageNavigationStateResult({
    currentPage,
    isHydrated,
    setCurrentPage,
  });
};
