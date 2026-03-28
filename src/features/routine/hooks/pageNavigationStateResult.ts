import type { Dispatch, SetStateAction } from "react";
import type { PageType } from "../pages/types";

type PageNavigationStateResultArgs = {
  currentPage: PageType;
  isHydrated: boolean;
  setCurrentPage: Dispatch<SetStateAction<PageType>>;
};

export const createPageNavigationStateResult = ({
  currentPage,
  isHydrated,
  setCurrentPage,
}: PageNavigationStateResultArgs) => {
  return {
    currentPage,
    isHydrated,
    setCurrentPage,
  };
};
