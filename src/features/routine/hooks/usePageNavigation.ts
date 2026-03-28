import { usePageNavigationActions } from "./usePageNavigationActions";
import { usePageNavigationPersistence } from "./usePageNavigationPersistence";
import { usePageNavigationState } from "./usePageNavigationState";
import { createPageNavigationResult } from "./pageNavigationResult";

/** ページナビゲーションの状態管理 */
export const usePageNavigation = () => {
  const navigationState = usePageNavigationState();
  usePageNavigationPersistence(navigationState.currentPage);
  const navigationActions = usePageNavigationActions(
    navigationState.setCurrentPage,
  );

  return createPageNavigationResult({
    navigationState,
    navigationActions,
  });
};
