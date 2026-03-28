import type { PageType } from "../pages/types";

type PageNavigationActionsResultArgs = {
  onPageChangeAction: (page: PageType) => void;
};

export const createPageNavigationActionsResult = ({
  onPageChangeAction,
}: PageNavigationActionsResultArgs) => {
  return { onPageChangeAction };
};
