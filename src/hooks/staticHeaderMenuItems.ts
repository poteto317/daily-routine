import { menuConfig } from "@/config";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import type { AppSettings } from "@/types/routine";

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
const ADMIN_ONLY_MENU_IDS = new Set<FeatureMenuId>([
  "account-admin",
  "test-matrix",
]);
const ALWAYS_VISIBLE_MENU_IDS = new Set(["home", "settings", "bug-report"]);

const isFeatureMenuId = (id: string): id is FeatureMenuId =>
  Object.prototype.hasOwnProperty.call(FEATURE_KEY_MAP, id);
const isAdminOnlyMenuId = (id: FeatureMenuId): boolean =>
  ADMIN_ONLY_MENU_IDS.has(id);

type FilterStaticHeaderMenuItemsParams = {
  visibleFeatures?: VisibleFeatures;
  isAdmin: boolean;
  isPageType: (route: string) => route is HeaderMenuItem["route"];
};

export const filterStaticHeaderMenuItems = ({
  visibleFeatures,
  isAdmin,
  isPageType,
}: FilterStaticHeaderMenuItemsParams): HeaderMenuItem[] => {
  return menuConfig.menuItems.filter((item): item is HeaderMenuItem => {
    if (!isPageType(item.route)) return false;
    if (item.id === "todo-lists") return false;
    if (ALWAYS_VISIBLE_MENU_IDS.has(item.id)) return true;
    if (isFeatureMenuId(item.id) && visibleFeatures) {
      if (isAdminOnlyMenuId(item.id) && !isAdmin) return false;
      return visibleFeatures[FEATURE_KEY_MAP[item.id]] !== false;
    }
    if (isFeatureMenuId(item.id) && isAdminOnlyMenuId(item.id)) return isAdmin;
    return true;
  });
};
