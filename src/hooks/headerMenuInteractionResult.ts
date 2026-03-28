import type { PageType } from "@/features/routine/pages/types";

type CreateHeaderMenuInteractionResultArgs = {
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  setMenuItemRef: (index: number, element: HTMLButtonElement | null) => void;
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

export const createHeaderMenuInteractionResult = ({
  menuButtonRef,
  setMenuItemRef,
  closeMenu,
  handleMenuToggleClick,
  handleNavigateClick,
  handleLogoutClick,
  handleMenuItemKeyDown,
  handleMenuKeyDown,
}: CreateHeaderMenuInteractionResultArgs) => ({
  menuButtonRef,
  setMenuItemRef,
  closeMenu,
  handleMenuToggleClick,
  handleNavigateClick,
  handleLogoutClick,
  handleMenuItemKeyDown,
  handleMenuKeyDown,
});
