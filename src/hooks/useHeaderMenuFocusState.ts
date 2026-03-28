import { useEffect, useRef } from "react";
import { syncHeaderMenuFocus } from "@/hooks/headerMenuInteractionActions";

export const useHeaderMenuFocusState = (isMenuOpen: boolean) => {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const shouldRestoreFocusRef = useRef(false);

  const markShouldRestoreFocus = () => {
    shouldRestoreFocusRef.current = true;
  };

  const clearRestoreFocus = () => {
    shouldRestoreFocusRef.current = false;
  };

  useEffect(() => {
    syncHeaderMenuFocus({
      isMenuOpen,
      menuItemElements: menuItemRefs.current,
      menuButtonElement: menuButtonRef.current,
      shouldRestoreFocus: shouldRestoreFocusRef.current,
      clearRestoreFocus,
    });
  }, [isMenuOpen]);

  const setMenuItemRef = (index: number, element: HTMLButtonElement | null) => {
    menuItemRefs.current[index] = element;
  };

  return {
    clearRestoreFocus,
    markShouldRestoreFocus,
    menuButtonRef,
    menuItemRefs,
    setMenuItemRef,
    shouldRestoreFocusRef,
  };
};
