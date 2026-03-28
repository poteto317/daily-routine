import type { usePageNavigationActions } from "./usePageNavigationActions";
import type { usePageNavigationState } from "./usePageNavigationState";

type PageNavigationState = ReturnType<typeof usePageNavigationState>;
type PageNavigationActions = ReturnType<typeof usePageNavigationActions>;

type CreatePageNavigationResultArgs = {
  navigationState: PageNavigationState;
  navigationActions: PageNavigationActions;
};

export const createPageNavigationResult = ({
  navigationState,
  navigationActions,
}: CreatePageNavigationResultArgs) => {
  return {
    currentPage: navigationState.currentPage,
    setCurrentPage: navigationState.setCurrentPage,
    isHydrated: navigationState.isHydrated,
    onPageChangeAction: navigationActions.onPageChangeAction,
  };
};
