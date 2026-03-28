import type { Dispatch, SetStateAction } from "react";
import { useHeaderMenuState } from "@/hooks/useHeaderMenuState";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";
import type { PageType } from "@/features/routine/pages/types";
import { createHeaderMenuControllerResult } from "@/hooks/headerMenuControllerResult";
import { useHeaderMenuControllerActions } from "@/hooks/useHeaderMenuControllerActions";
import { useHeaderMenuNavigationAction } from "@/hooks/useHeaderMenuNavigationAction";

export type UseHeaderMenuControllerParams = {
  onNavigateAction: (page: PageType) => void;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

export type UseHeaderMenuControllerResult = {
  isMenuOpen: boolean;
  setIsMenuOpenAction: Dispatch<SetStateAction<boolean>>;
  filteredMenuItems: HeaderMenuItem[];
  onNavigateAction: (page: PageType) => void;
  onLogoutAction: () => Promise<void>;
};

export const useHeaderMenuController = ({
  onNavigateAction: onNavigateRootAction,
  isAdmin,
  signOut,
}: UseHeaderMenuControllerParams): UseHeaderMenuControllerResult => {
  const { closeMenu, isMenuOpen, setIsMenuOpenAction } = useHeaderMenuState();
  const onNavigateAction = useHeaderMenuNavigationAction(
    onNavigateRootAction,
    closeMenu,
  );
  const { filteredMenuItems, onLogoutAction } = useHeaderMenuControllerActions(
    isMenuOpen,
    isAdmin,
    signOut,
    closeMenu,
  );

  return createHeaderMenuControllerResult({
    isMenuOpen,
    setIsMenuOpenAction,
    filteredMenuItems,
    onNavigateAction,
    onLogoutAction,
  });
};
