import type { PageType } from "@/features/routine/pages/types";

type FocusSyncParams = {
  isMenuOpen: boolean;
  menuItemElements: Array<{ focus: () => void } | null>;
  menuButtonElement: { focus: () => void } | null;
  shouldRestoreFocus: boolean;
  clearRestoreFocus: () => void;
};

export const syncHeaderMenuFocus = ({
  isMenuOpen,
  menuItemElements,
  menuButtonElement,
  shouldRestoreFocus,
  clearRestoreFocus,
}: FocusSyncParams) => {
  if (isMenuOpen) {
    menuItemElements[0]?.focus();
    return;
  }

  if (shouldRestoreFocus) {
    menuButtonElement?.focus();
    clearRestoreFocus();
  }
};

type CloseMenuParams = {
  markShouldRestoreFocus: () => void;
  setIsMenuOpenAction: (isOpen: boolean) => void;
};

export const closeHeaderMenu = ({
  markShouldRestoreFocus,
  setIsMenuOpenAction,
}: CloseMenuParams) => {
  markShouldRestoreFocus();
  setIsMenuOpenAction(false);
};

type ToggleMenuParams = CloseMenuParams & {
  isMenuOpen: boolean;
};

export const toggleHeaderMenu = ({
  isMenuOpen,
  markShouldRestoreFocus,
  setIsMenuOpenAction,
}: ToggleMenuParams) => {
  if (isMenuOpen) {
    closeHeaderMenu({ markShouldRestoreFocus, setIsMenuOpenAction });
    return;
  }

  setIsMenuOpenAction(true);
};

type NavigateParams = {
  page: PageType;
  markShouldRestoreFocus: () => void;
  onNavigateAction: (page: PageType) => void;
};

export const navigateFromHeaderMenu = ({
  page,
  markShouldRestoreFocus,
  onNavigateAction,
}: NavigateParams) => {
  markShouldRestoreFocus();
  onNavigateAction(page);
};

type LogoutParams = {
  markShouldRestoreFocus: () => void;
  onLogoutAction: () => Promise<void>;
};

export const logoutFromHeaderMenu = ({
  markShouldRestoreFocus,
  onLogoutAction,
}: LogoutParams) => {
  markShouldRestoreFocus();
  void onLogoutAction();
};

type EscapeKeyParams = CloseMenuParams & {
  event: Pick<React.KeyboardEvent<HTMLElement>, "key">;
};

export const handleHeaderMenuEscapeKey = ({
  event,
  markShouldRestoreFocus,
  setIsMenuOpenAction,
}: EscapeKeyParams) => {
  if (event.key !== "Escape") {
    return;
  }

  closeHeaderMenu({ markShouldRestoreFocus, setIsMenuOpenAction });
};
