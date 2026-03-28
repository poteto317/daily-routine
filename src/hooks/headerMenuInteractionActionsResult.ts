import type { PageType } from "@/features/routine/pages/types";

type CreateHeaderMenuInteractionActionsResultArgs = {
  closeMenu: () => void;
  handleMenuToggleClick: () => void;
  handleNavigateClick: (page: PageType) => void;
  handleLogoutClick: () => void;
  handleMenuItemKeyDown: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => void;
  handleMenuKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
};

export const createHeaderMenuInteractionActionsResult = ({
  closeMenu,
  handleMenuToggleClick,
  handleNavigateClick,
  handleLogoutClick,
  handleMenuItemKeyDown,
  handleMenuKeyDown,
}: CreateHeaderMenuInteractionActionsResultArgs) => {
  return {
    closeMenu,
    handleMenuToggleClick,
    handleNavigateClick,
    handleLogoutClick,
    handleMenuItemKeyDown,
    handleMenuKeyDown,
  };
};
