import { menuConfig, type MenuItem } from "@/config";
import type { PageType } from "@/features/routine/pages/types";
import type { AppSettings } from "@/types/routine";
import type { TodoList } from "@/features/todo-lists/types";

const TODO_LIST_MENU_ID_PREFIX = "todo-list-";

// menuConfig.menuItemsに実在する静的メニュー項目のidセット。
// 静的メニュー項目「Todoリスト管理」自体のid（"todo-list-management"）も
// "todo-list-"で始まるため、前方一致だけでは個別のTodoリスト項目と
// 誤って同一視してしまう（実際に発生した不具合）。「静的メニュー項目として
// 実在するidかどうか」という一次情報（menuConfig自体）を基準に除外することで、
// 将来"todo-list-"で始まる別の静的idが追加された場合も、この一次情報から
// 自動的に対応でき、個別に除外リストを保守し続ける必要がない。
const STATIC_MENU_ITEM_IDS = new Set(
  menuConfig.menuItems.map((item) => item.id),
);

const isTodoListMenuItemId = (id: string): boolean => {
  return (
    id.startsWith(TODO_LIST_MENU_ID_PREFIX) && !STATIC_MENU_ITEM_IDS.has(id)
  );
};

/**
 * TodoリストのIDからメニュー項目ID（`todo-list-<id>`）を組み立てる。
 * ハンバーガーメニュー本体・設定画面の並び替えUI・Todoリスト管理ページの
 * 3箇所で同じ組み立て方をする必要があるため、ここに集約する。
 */
export const toTodoListMenuItemId = (listId: string): string =>
  `${TODO_LIST_MENU_ID_PREFIX}${listId}`;

/**
 * メニュー項目（Todoリストの個別項目を含む）を`menuOrder`設定に基づいて
 * 並べ替えるためのランクを算出する。ハンバーガーメニュー本体
 * （orderHeaderMenuItems）・設定画面の並び替えUI（MenuOrderSection.tsx）・
 * Todoリスト管理ページ（todoListManagementOrder.ts）の3箇所が同じ並び順の
 * 基準を共有するため、ロジックをこの1箇所に集約している。
 */
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

/**
 * items配列を、あらかじめ渡されたnaturalOrderIds（各itemの既定の
 * フォールバック順）とmenuOrder設定を基準に並べ替える。
 * ハンバーガーメニュー本体（orderHeaderMenuItems）・設定画面の並び替えUI
 * （MenuOrderSection.tsx）・Todoリスト管理ページ（todoListManagementOrder.ts）
 * の3箇所で「id→indexのMapを事前に1回だけ作り、getMenuOrderRankで
 * 並べ替える」という同じ手順が必要なため、ここに集約する。
 *
 * getMenuOrderRank自体がmenuOrder.indexOf（線形探索）を行うため、
 * sort()のコンパレータ内で都度呼び出すと比較回数（O(n log n)）分だけ
 * 線形探索が繰り返されてしまう。各itemのランクをソート前に1回だけ計算して
 * 保持しておき（decorate-sort-undecorateパターン）、コンパレータでは
 * 計算済みの数値同士を比較するだけにすることで、ランク計算をO(n)回に
 * 抑えている。
 */
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

  decorated.sort((a, b) => a.rank - b.rank);

  return decorated.map(({ item }) => item);
};

export type HeaderMenuItem = Omit<MenuItem, "route"> & {
  route: PageType;
  onBeforeNavigate?: () => void;
  isActive?: boolean;
};

type VisibleFeatures = NonNullable<AppSettings["visibleFeatures"]>;

type FeatureMenuId =
  | "journal"
  | "calendar"
  | "statistics"
  | "pomodoro"
  | "worktracker"
  | "weight-tracker"
  | "workout-tracker"
  | "meal"
  | "budget"
  | "weather"
  | "preset"
  | "todo-lists"
  | "sync-management"
  | "test-matrix"
  | "account-admin";

const FEATURE_KEY_MAP: Record<FeatureMenuId, keyof VisibleFeatures> = {
  journal: "journal",
  calendar: "calendar",
  statistics: "statistics",
  pomodoro: "pomodoro",
  worktracker: "worktracker",
  "weight-tracker": "weightTracker",
  "workout-tracker": "workoutTracker",
  meal: "meal",
  budget: "budget",
  weather: "weather",
  preset: "preset",
  "todo-lists": "todoLists",
  "sync-management": "syncManagement",
  "test-matrix": "testMatrix",
  "account-admin": "accountAdmin",
};

const isFeatureMenuId = (id: string): id is FeatureMenuId => {
  return Object.prototype.hasOwnProperty.call(FEATURE_KEY_MAP, id);
};

const ADMIN_ONLY_MENU_IDS = new Set<FeatureMenuId>([
  "account-admin",
  "test-matrix",
]);

const isAdminOnlyMenuId = (id: FeatureMenuId): boolean =>
  ADMIN_ONLY_MENU_IDS.has(id);

const PINNED_FIRST = new Set(["home"]);
const PINNED_LAST = new Set(["settings", "account-admin"]);

type BuildDynamicTodoMenuItemsParams = {
  isMenuOpen: boolean;
  todoListsVisible: boolean;
  todoLists: TodoList[];
  currentSelectedId: string | null;
  setSelectedTodoListId: (id: string) => void;
};

export const buildDynamicTodoMenuItems = ({
  isMenuOpen,
  todoListsVisible,
  todoLists,
  currentSelectedId,
  setSelectedTodoListId,
}: BuildDynamicTodoMenuItemsParams): HeaderMenuItem[] => {
  if (!isMenuOpen || !todoListsVisible) {
    return [];
  }

  return todoLists
    .filter((list) => !list.isHidden)
    .map((list) => ({
      id: toTodoListMenuItemId(list.id),
      label: list.title,
      icon: "✅",
      route: "todo-lists" as const,
      isActive: list.id === currentSelectedId,
      onBeforeNavigate: () => setSelectedTodoListId(list.id),
    }));
};

type FilterStaticHeaderMenuItemsParams = {
  visibleFeatures?: VisibleFeatures;
  isAdmin: boolean;
  isPageType: (route: string) => route is PageType;
};

export const filterStaticHeaderMenuItems = ({
  visibleFeatures,
  isAdmin,
  isPageType,
}: FilterStaticHeaderMenuItemsParams): HeaderMenuItem[] => {
  return menuConfig.menuItems.filter((item): item is HeaderMenuItem => {
    if (!isPageType(item.route)) return false;
    if (item.id === "todo-lists") return false;
    if (item.id === "home" || item.id === "settings") return true;
    if (isFeatureMenuId(item.id) && visibleFeatures) {
      if (isAdminOnlyMenuId(item.id) && !isAdmin) {
        return false;
      }
      return visibleFeatures[FEATURE_KEY_MAP[item.id]] !== false;
    }
    if (isFeatureMenuId(item.id) && isAdminOnlyMenuId(item.id)) return isAdmin;
    return true;
  });
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
