import type { PageType } from "@/features/routine/pages/types";
import { createHeaderMenuInteractionResult } from "@/hooks/headerMenuInteractionResult";
import { useHeaderMenuFocusState } from "@/hooks/useHeaderMenuFocusState";
import { useHeaderMenuInteractionActions } from "@/hooks/useHeaderMenuInteractionActions";

type UseHeaderMenuInteractionParams = {
  isMenuOpen: boolean;
  setIsMenuOpenAction: (isOpen: boolean) => void;
  onNavigateAction: (page: PageType) => void;
  onLogoutAction: () => Promise<void>;
};

export const useHeaderMenuInteraction = ({
  isMenuOpen,
  setIsMenuOpenAction,
  onNavigateAction,
  onLogoutAction,
}: UseHeaderMenuInteractionParams) => {
  const {
    menuButtonRef,
    menuItemRefs,
    markShouldRestoreFocus,
    setMenuItemRef,
  } = useHeaderMenuFocusState(isMenuOpen);
  const actions = useHeaderMenuInteractionActions({
    isMenuOpen,
    menuItemRefs,
    markShouldRestoreFocus,
    setIsMenuOpenAction,
    onNavigateAction,
    onLogoutAction,
  });

  return createHeaderMenuInteractionResult({
    menuButtonRef,
    setMenuItemRef,
    ...actions,
  });
};
