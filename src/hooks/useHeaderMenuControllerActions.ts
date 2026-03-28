import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { createHeaderMenuControllerActionsResult } from "@/hooks/headerMenuControllerActionsResult";
import { useHeaderMenuActionBindings } from "@/hooks/useHeaderMenuActionBindings";

export const useHeaderMenuControllerActions = (
  isMenuOpen: boolean,
  isAdmin: boolean,
  signOut: () => Promise<void>,
  closeMenu: () => void,
) => {
  const { filteredMenuItems, onLogoutAction } = useHeaderMenuActionBindings(
    isMenuOpen,
    isAdmin,
    signOut,
    closeMenu,
  );

  useBodyScrollLock(isMenuOpen);

  return createHeaderMenuControllerActionsResult({
    filteredMenuItems,
    onLogoutAction,
  });
};
