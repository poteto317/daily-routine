import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

type CreateHeaderMenuControllerActionsResultArgs = {
  filteredMenuItems: HeaderMenuItem[];
  onLogoutAction: () => Promise<void>;
};

export const createHeaderMenuControllerActionsResult = ({
  filteredMenuItems,
  onLogoutAction,
}: CreateHeaderMenuControllerActionsResultArgs) => {
  return {
    filteredMenuItems,
    onLogoutAction,
  };
};
