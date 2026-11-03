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

/**
 * menuOrder の中で最後に載っている Todoリストのメニュー ID の添字（無ければ -1）。
 * 呼び出し元ごとに異なる naturalOrderIds（メニューは表示中のリストだけ、
 * 管理画面と設定画面は全リスト）ではなく menuOrder だけで決めるので、
 * どの画面でも基準の位置が同じになる。
 */
const findLastTodoListMenuItemIndex = (menuOrder: string[]): number => {
  for (let index = menuOrder.length - 1; index >= 0; index -= 1) {
    if (isTodoListMenuItemId(menuOrder[index])) return index;
  }
  return -1;
};

/**
 * 並び順の順位（小さいほど前）。
 * 1. menuOrder に載っている項目はその添字。
 * 2. 載っていない Todoリストは、旧来の "todo-lists" があればその直後。
 * 3. 旧来の "todo-lists" が無く、Todoリストの ID が載っていれば、
 *    最後に載っているリストの直後。
 * 4. それ以外は menuOrder.length + fallbackIndex（末尾に自然順）。
 *
 * 2 と 3 で足す (fallbackIndex + 1) / (totalItems + 1) は 0 より大きく 1 より
 * 小さいので、整数の添字と等しくならず、載っていない複数のリストは
 * 自然順を保つ。4 の順位は menuOrder.length 以上なので、2・3 より必ず後ろになる。
 */
const getMenuOrderRank = (
  itemId: string,
  fallbackIndex: number,
  menuOrder: string[],
  totalItems: number,
  lastTodoListIndex: number,
): number => {
  const configuredIndex = menuOrder.indexOf(itemId);
  if (configuredIndex !== -1) return configuredIndex;

  if (isTodoListMenuItemId(itemId)) {
    const offset = (fallbackIndex + 1) / (totalItems + 1);
    const legacyTodoIndex = menuOrder.indexOf("todo-lists");
    if (legacyTodoIndex !== -1) return legacyTodoIndex + offset;
    if (lastTodoListIndex !== -1) return lastTodoListIndex + offset;
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
  const lastTodoListIndex = findLastTodoListMenuItemIndex(menuOrder);
  const decorated = items.map((item) => {
    const id = getId(item);
    return {
      item,
      rank: getMenuOrderRank(
        id,
        naturalIndexById.get(id) ?? 0,
        menuOrder,
        naturalOrderIds.length,
        lastTodoListIndex,
      ),
    };
  });

  decorated.sort((left, right) => left.rank - right.rank);
  return decorated.map(({ item }) => item);
};

/**
 * menuOrder を全項目の配列として書き直すときの自然順。
 * menuConfig の順に、固定の項目（先頭の home・末尾の settings / account-admin）を除いて並べ、
 * "todo-lists" の位置に渡した Todoリストのメニュー ID を順に入れる。
 * 表示設定や管理者かどうかでは絞らない（絞ってもメニューに出る項目同士の相対順は変わらない）。
 */
export const buildMenuOrderNaturalIds = (todoListMenuIds: string[]): string[] =>
  menuConfig.menuItems.flatMap((item) => {
    if (item.id === "todo-lists") return todoListMenuIds;
    if (PINNED_FIRST.has(item.id) || PINNED_LAST.has(item.id)) return [];
    return [item.id];
  });

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
