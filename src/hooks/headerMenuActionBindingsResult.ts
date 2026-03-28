import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

type CreateHeaderMenuActionBindingsResultArgs = {
  filteredMenuItems: HeaderMenuItem[];
  onLogoutAction: () => Promise<void>;
};

export const createHeaderMenuActionBindingsResult = ({
  filteredMenuItems,
  onLogoutAction,
}: CreateHeaderMenuActionBindingsResultArgs) => {
  return {
    filteredMenuItems,
    onLogoutAction,
  };
};
