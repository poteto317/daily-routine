import type { Dispatch, SetStateAction } from "react";

type CreateHeaderMenuStateResultArgs = {
  isMenuOpen: boolean;
  setIsMenuOpenAction: Dispatch<SetStateAction<boolean>>;
  closeMenu: () => void;
};

export const createHeaderMenuStateResult = ({
  isMenuOpen,
  setIsMenuOpenAction,
  closeMenu,
}: CreateHeaderMenuStateResultArgs) => {
  return {
    isMenuOpen,
    setIsMenuOpenAction,
    closeMenu,
  };
};
