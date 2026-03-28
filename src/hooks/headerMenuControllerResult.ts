import type { Dispatch, SetStateAction } from "react";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";
import type { PageType } from "@/features/routine/pages/types";

type CreateHeaderMenuControllerResultArgs = {
  isMenuOpen: boolean;
  setIsMenuOpenAction: Dispatch<SetStateAction<boolean>>;
  filteredMenuItems: HeaderMenuItem[];
  onNavigateAction: (page: PageType) => void;
  onLogoutAction: () => Promise<void>;
};

export const createHeaderMenuControllerResult = ({
  isMenuOpen,
  setIsMenuOpenAction,
  filteredMenuItems,
  onNavigateAction,
  onLogoutAction,
}: CreateHeaderMenuControllerResultArgs) => ({
  isMenuOpen,
  setIsMenuOpenAction,
  filteredMenuItems,
  onNavigateAction,
  onLogoutAction,
});
