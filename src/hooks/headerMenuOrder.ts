import { menuConfig } from "@/config";
import { TODO_LIST_MENU_ID_PREFIX } from "@/hooks/dynamicTodoMenuItems";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";

const STATIC_MENU_ITEM_IDS = new Set(
  menuConfig.menuItems.map((item) => item.id),
);
const PINNED_FIRST = new Set(["home"]);
const PINNED_LAST = new Set(["settings", "account-admin"]);

const isTodoListMenuItemId = (id: string): boolean =>
  id.startsWith(TODO_LIST_MENU_ID_PREFIX) && !STATIC_MENU_ITEM_IDS.has(id);

const getMenuOrderRank = (
  itemId: string,
  fallbackIndex: number,
  menuOrder: string[],
  totalItems: number,
): number => {
  const configuredIndex = menuOrder.indexOf(itemId);
  if (configuredIndex !== -1) return configuredIndex;

  if (isTodoListMenuItemId(itemId)) {
    const legacyTodoIndex = menuOrder.indexOf("todo-lists");
    if (legacyTodoIndex !== -1) {
      return legacyTodoIndex + (fallbackIndex + 1) / (totalItems + 1);
    }
  }

  return menuOrder.length + fallbackIndex;
};

export const sortByMenuOrder = <T>(
  items: T[],
  getId: (item: T) => string,
  naturalOrderIds: string[],
  menuOrder: string[],
): T[] => {
  const naturalIndexById = new Map(
    naturalOrderIds.map((id, index) => [id, index]),
  );
  const decorated = items.map((item) => {
    const id = getId(item);
    return {
      item,
      rank: getMenuOrderRank(
        id,
        naturalIndexById.get(id) ?? 0,
        menuOrder,
        naturalOrderIds.length,
      ),
    };
  });

  decorated.sort((left, right) => left.rank - right.rank);
  return decorated.map(({ item }) => item);
};

type OrderHeaderMenuItemsParams = {
  staticItems: HeaderMenuItem[];
  dynamicItems: HeaderMenuItem[];
  menuOrder: string[];
};

export const orderHeaderMenuItems = ({
  staticItems,
  dynamicItems,
  menuOrder,
}: OrderHeaderMenuItemsParams): HeaderMenuItem[] => {
  const pinnedFirst = staticItems.filter((item) => PINNED_FIRST.has(item.id));
  const staticReorderable = staticItems.filter(
    (item) => !PINNED_FIRST.has(item.id) && !PINNED_LAST.has(item.id),
  );
  const pinnedLast = staticItems.filter((item) => PINNED_LAST.has(item.id));
  const reorderable = [...staticReorderable, ...dynamicItems];
  const defaultOrderIds = menuConfig.menuItems.flatMap((item) => {
    if (item.id === "todo-lists") {
      return dynamicItems.map((dynamicItem) => dynamicItem.id);
    }

    return reorderable.some((reorderableItem) => reorderableItem.id === item.id)
      ? [item.id]
      : [];
  });
  const sortedReorderable = sortByMenuOrder(
    reorderable,
    (item) => item.id,
    defaultOrderIds,
    menuOrder,
  );

  return [...pinnedFirst, ...sortedReorderable, ...pinnedLast];
};
