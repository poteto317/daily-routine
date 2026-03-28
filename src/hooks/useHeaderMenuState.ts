import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createHeaderMenuStateResult } from "@/hooks/headerMenuStateResult";

export type UseHeaderMenuStateResult = {
  isMenuOpen: boolean;
  setIsMenuOpenAction: Dispatch<SetStateAction<boolean>>;
  closeMenu: () => void;
};

export const useHeaderMenuState = (): UseHeaderMenuStateResult => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return createHeaderMenuStateResult({
    isMenuOpen,
    setIsMenuOpenAction: setIsMenuOpen,
    closeMenu,
  });
};
