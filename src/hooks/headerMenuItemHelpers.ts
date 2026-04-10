import { menuConfig, type MenuItem } from "@/config";
import type { PageType } from "@/features/routine/pages/types";
import type { AppSettings } from "@/types/routine";
import type { TodoList } from "@/features/todo-lists/types";

const TODO_LIST_MENU_ID_PREFIX = "todo-list-";

const isTodoListMenuItemId = (id: string): boolean => {
  return id.startsWith(TODO_LIST_MENU_ID_PREFIX);
};

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
      id: `${TODO_LIST_MENU_ID_PREFIX}${list.id}`,
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
      if (
        (item.id === "account-admin" || item.id === "test-matrix") &&
        !isAdmin
      ) {
        return false;
      }
      return visibleFeatures[FEATURE_KEY_MAP[item.id]] !== false;
    }
    if (item.id === "account-admin" || item.id === "test-matrix")
      return isAdmin;
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

  reorderable.sort((a, b) => {
    const aFallbackIndex = defaultOrderIds.indexOf(a.id);
    const bFallbackIndex = defaultOrderIds.indexOf(b.id);

    return (
      getMenuOrderRank(
        a.id,
        aFallbackIndex,
        menuOrder,
        defaultOrderIds.length,
      ) -
      getMenuOrderRank(b.id, bFallbackIndex, menuOrder, defaultOrderIds.length)
    );
  });

  return [...pinnedFirst, ...reorderable, ...pinnedLast];
};
