import type { PageType } from "@/features/routine/pages/types";
import { focusMenuItem } from "@/hooks/header-menu-interaction/focusMenuItem";
import { handleMenuItemNavigationKey } from "@/hooks/header-menu-interaction/handleMenuItemNavigationKey";
import { createHeaderMenuInteractionActionsResult } from "@/hooks/headerMenuInteractionActionsResult";
import {
  closeHeaderMenu,
  handleHeaderMenuEscapeKey,
  logoutFromHeaderMenu,
  navigateFromHeaderMenu,
  toggleHeaderMenu,
} from "@/hooks/headerMenuInteractionActions";

type UseHeaderMenuInteractionActionsParams = {
  isMenuOpen: boolean;
  menuItemRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  markShouldRestoreFocus: () => void;
  setIsMenuOpenAction: (isOpen: boolean) => void;
  onNavigateAction: (page: PageType) => void;
  onLogoutAction: () => Promise<void>;
};

export const useHeaderMenuInteractionActions = ({
  isMenuOpen,
  menuItemRefs,
  markShouldRestoreFocus,
  setIsMenuOpenAction,
  onNavigateAction,
  onLogoutAction,
}: UseHeaderMenuInteractionActionsParams) => {
  const closeMenu = () => {
    closeHeaderMenu({ markShouldRestoreFocus, setIsMenuOpenAction });
  };

  const handleMenuToggleClick = () => {
    toggleHeaderMenu({
      isMenuOpen,
      markShouldRestoreFocus,
      setIsMenuOpenAction,
    });
  };

  const handleNavigateClick = (page: PageType) => {
    navigateFromHeaderMenu({
      page,
      markShouldRestoreFocus,
      onNavigateAction,
    });
  };

  const handleLogoutClick = () => {
    logoutFromHeaderMenu({
      markShouldRestoreFocus,
      onLogoutAction,
    });
  };

  const handleMenuItemKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    handleMenuItemNavigationKey({
      event,
      currentIndex,
      focusAtIndex: (index) => focusMenuItem(menuItemRefs.current, index),
    });
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    handleHeaderMenuEscapeKey({
      event,
      markShouldRestoreFocus,
      setIsMenuOpenAction,
    });
  };

  return createHeaderMenuInteractionActionsResult({
    closeMenu,
    handleMenuToggleClick,
    handleNavigateClick,
    handleLogoutClick,
    handleMenuItemKeyDown,
    handleMenuKeyDown,
  });
};
