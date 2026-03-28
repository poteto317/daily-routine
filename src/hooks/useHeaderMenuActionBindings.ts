import { useHeaderLogout } from "@/hooks/useHeaderLogout";
import { createHeaderMenuActionBindingsResult } from "@/hooks/headerMenuActionBindingsResult";
import { useHeaderMenuItems } from "@/hooks/useHeaderMenuItems";

export const useHeaderMenuActionBindings = (
  isMenuOpen: boolean,
  isAdmin: boolean,
  signOut: () => Promise<void>,
  closeMenu: () => void,
) => {
  const filteredMenuItems = useHeaderMenuItems(isMenuOpen, isAdmin);
  const { handleLogout } = useHeaderLogout({
    signOut,
    closeMenu,
  });

  return createHeaderMenuActionBindingsResult({
    filteredMenuItems,
    onLogoutAction: handleLogout,
  });
};
