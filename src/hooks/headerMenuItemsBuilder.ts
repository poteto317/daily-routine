import { VALID_PAGES, type PageType } from "@/features/routine/pages/types";
import { buildDynamicTodoMenuItems } from "@/hooks/dynamicTodoMenuItems";
import type { HeaderMenuItemData } from "@/hooks/headerMenuItemData";
import { orderHeaderMenuItems } from "@/hooks/headerMenuOrder";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import { filterStaticHeaderMenuItems } from "@/hooks/staticHeaderMenuItems";

const isPageType = (route: string): route is PageType => {
  return (VALID_PAGES as readonly string[]).includes(route);
};

type CreateHeaderMenuItemsArgs = {
  isAdmin: boolean;
  isMenuOpen: boolean;
  menuData: HeaderMenuItemData;
};

export const createHeaderMenuItems = ({
  isAdmin,
  isMenuOpen,
  menuData,
}: CreateHeaderMenuItemsArgs): HeaderMenuItem[] => {
  const dynamicItems = buildDynamicTodoMenuItems({
    isMenuOpen,
    todoListsVisible: menuData.todoListsVisible,
    todoLists: menuData.todoLists,
    currentSelectedId: menuData.currentSelectedId,
    setSelectedTodoListId: menuData.setSelectedTodoListId,
  });
  const staticItems = filterStaticHeaderMenuItems({
    visibleFeatures: menuData.visibleFeatures,
    isAdmin,
    isPageType,
  });

  return orderHeaderMenuItems({
    staticItems,
    dynamicItems,
    menuOrder: menuData.menuOrder,
  });
};
