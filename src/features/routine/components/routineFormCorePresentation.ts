import texts from "../locales/ja.json";

export const ROUTINE_FORM_TITLE_LABEL = texts.routineFormCore.titleLabel;
export const ROUTINE_FORM_TITLE_PLACEHOLDER =
  texts.routineFormCore.titlePlaceholder;
export const ROUTINE_FORM_DAYS_LABEL = texts.routineFormCore.daysLabel;
export const ROUTINE_FORM_CATEGORY_LABEL = texts.routineFormCore.categoryLabel;
export const ROUTINE_FORM_DAYS_WARNING_LABEL =
  texts.routineFormCore.daysWarningLabel;
export const ROUTINE_FORM_DAYS_CREATE_HINT =
  texts.routineFormCore.daysCreateHint;

export const getRoutineDayButtonClassName = (params: {
  isSelected: boolean;
  isHoliday: boolean;
}): string => {
  const { isSelected, isHoliday } = params;

  if (isSelected && isHoliday) {
    return "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-red-600 text-white shadow-md";
  }
  if (isSelected) {
    return "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-blue-600 text-white shadow-md";
  }
  return "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-white text-gray-700 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-50";
};

export const getRoutineCategoryButtonClassName = (
  categoryValue: string,
  selectedCategory: string,
  activeColorClass: string,
): string =>
  categoryValue === selectedCategory
    ? `px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeColorClass} ring-2 ring-blue-500`
    : "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-white text-gray-700 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-50";
