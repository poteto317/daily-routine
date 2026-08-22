import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import { getHeaderMenuItemData } from "@/hooks/headerMenuItemData";
import { createHeaderMenuItems } from "@/hooks/headerMenuItemsBuilder";

export type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";

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
