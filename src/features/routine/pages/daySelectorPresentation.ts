import texts from "../locales/ja.json";

export const DAYS = texts.daySelector.days;
export const DAY_SELECTOR_TEXT = {
  holiday: texts.daySelector.holiday,
} as const;

export const getDaySelectorButtonClassName = (
  isSelected: boolean,
  isHoliday: boolean,
): string => {
  if (isSelected) {
    return isHoliday
      ? "bg-red-600 text-white shadow-md"
      : "bg-purple-600 text-white shadow-md";
  }

  return "bg-white dark:bg-slate-100 text-gray-700 dark:text-gray-800 border border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-200";
};
