import type { HeaderMenuItem } from "@/hooks/headerMenuItemHelpers";
import { getHeaderMenuItemData } from "@/hooks/headerMenuItemData";
import { createHeaderMenuItems } from "@/hooks/headerMenuItemsBuilder";

export type { HeaderMenuItem } from "@/hooks/headerMenuItemHelpers";

export type UseHeaderMenuItemsResult = HeaderMenuItem[];

export const useHeaderMenuItems = (
  isMenuOpen: boolean,
  isAdmin: boolean,
): UseHeaderMenuItemsResult => {
  const menuData = getHeaderMenuItemData(isMenuOpen);
  return createHeaderMenuItems({
    isAdmin,
    isMenuOpen,
    menuData,
  });
};
