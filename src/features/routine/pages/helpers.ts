import texts from "../locales/ja.json";
import type { HomePageData } from "./homeTypes";
import type { PageLayoutProps } from "./PageLayout";
import type {
  HomeContentSource,
  HomeRoutineFormProps,
  HomeRoutineListProps,
  HomeToolbarProps,
} from "./homeTypes";
import {
  createHomePageLayoutProps,
  createHomeRoutineFormProps,
  createHomeRoutineListProps,
  createHomeToolbarProps,
} from "./pageViewModelActions";

// ===============================
// Home Page Text
// ===============================
export const HOME_PAGE_TEXT = texts.homePage;

// ===============================
// Home Toolbar
// ===============================
export const HOME_TOOLBAR_TEXT = texts.homeToolbar;

// ===============================
// Empty State
// ===============================
export const ROUTINE_EMPTY_STATE_TEXT = texts.emptyState;

export const getEmptyMessage = (
  allRoutinesCount: number,
  viewMode: "holiday" | number,
): string => {
  if (allRoutinesCount === 0) return ROUTINE_EMPTY_STATE_TEXT.noRoutines;
  return viewMode === "holiday"
    ? ROUTINE_EMPTY_STATE_TEXT.noHolidayRoutines
    : ROUTINE_EMPTY_STATE_TEXT.noDayRoutines;
};

export const getAddButtonLabel = (allRoutinesCount: number): string =>
  allRoutinesCount === 0
    ? ROUTINE_EMPTY_STATE_TEXT.addFirst
    : ROUTINE_EMPTY_STATE_TEXT.addMore;

// ===============================
// Category Filter
// ===============================
export const CATEGORY_FILTER_TEXT = texts.categoryFilter;

export const getCategoryFilterButtonClassName = (
  isSelected: boolean,
  selectedCategoryClassName?: string,
): string => {
  if (!isSelected)
    return "bg-white dark:bg-slate-100 text-gray-700 dark:text-gray-800 border border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-200";

  return selectedCategoryClassName
    ? `${selectedCategoryClassName} ring-2 ring-blue-500 shadow-md`
    : "bg-blue-600 text-white shadow-md";
};

// ===============================
// Day Selector
// ===============================
export const DAYS = texts.daySelector.days;
export const DAY_SELECTOR_TEXT = {
  holiday: texts.daySelector.holiday,
} as const;

export const getDaySelectorButtonClassName = (
  isSelected: boolean,
  isHoliday: boolean,
): string => {
  if (isSelected)
    return isHoliday
      ? "bg-red-600 text-white shadow-md"
      : "bg-purple-600 text-white shadow-md";

  return "bg-white dark:bg-slate-100 text-gray-700 dark:text-gray-800 border border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-200";
};

// ===============================
// Home Content View Model
// ===============================
export type HomeContentViewModel = {
  toolbarProps: HomeToolbarProps;
  routineListProps: HomeRoutineListProps;
  routineFormProps: HomeRoutineFormProps;
  showRoutineForm: boolean;
};

export const createHomeContentViewModel = (
  data: HomeContentSource,
): HomeContentViewModel => {
  return {
    toolbarProps: createHomeToolbarProps(data),
    routineListProps: createHomeRoutineListProps(data),
    routineFormProps: createHomeRoutineFormProps(data),
    showRoutineForm: data.crud.showForm,
  };
};

// ===============================
// Home Page View Model
// ===============================
type HomePageLayoutProps = Pick<
  PageLayoutProps,
  "currentPage" | "isEditMode" | "onNavigateAction" | "onToggleEditModeAction"
>;

export type HomePageViewModel = {
  isHydrated: HomePageData["isHydrated"];
  pageLayoutProps: HomePageLayoutProps;
  contentViewModel: HomeContentViewModel;
};

export const createHomePageViewModel = (
  data: HomePageData,
): HomePageViewModel => {
  return {
    isHydrated: data.isHydrated,
    pageLayoutProps: createHomePageLayoutProps(data),
    contentViewModel: createHomeContentViewModel(data),
  };
};
