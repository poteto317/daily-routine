import { useCallback } from "react";
import type { PageType } from "@/features/routine/pages/types";

export const useHeaderMenuNavigationAction = (
  onNavigateRootAction: (page: PageType) => void,
  closeMenu: () => void,
) => {
  return useCallback(
    (page: PageType) => {
      onNavigateRootAction(page);
      closeMenu();
    },
    [closeMenu, onNavigateRootAction],
  );
};
