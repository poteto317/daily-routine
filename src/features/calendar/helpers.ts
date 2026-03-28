/**
 * Calendar feature helper functions
 */

import texts from "./locales/ja.json";

/**
 * Get calendar day button class name
 */
export const getCalendarDayButtonClassName = (params: {
  isFuture: boolean;
  isSelected: boolean;
  isToday: boolean;
}): string => {
  const { isFuture, isSelected, isToday } = params;

  return `aspect-square p-1 rounded-lg transition-all relative ${
    isFuture
      ? "cursor-not-allowed opacity-40"
      : "hover:bg-gray-100 dark:hover:bg-slate-200 cursor-pointer"
  } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-100" : ""} ${isToday ? "font-bold ring-2 ring-blue-300" : ""}`;
};

/**
 * Get calendar day text class name
 */
export const getCalendarDayTextClassName = (params: {
  isHolidayOrWeekend: boolean;
  isToday: boolean;
}): string => {
  const { isHolidayOrWeekend, isToday } = params;

  return `text-sm ${
    isHolidayOrWeekend
      ? "text-red-600 dark:text-red-700"
      : "text-gray-900 dark:text-gray-900"
  } ${isToday ? "font-bold" : ""}`;
};

/**
 * Get completion dot class name
 */
export const getCompletionDotClassName = (
  completionCount: number,
  totalCount: number,
): string => {
  if (completionCount === totalCount && totalCount > 0)
    return "w-2 h-2 rounded-full bg-green-500";

  return "w-2 h-2 rounded-full bg-yellow-500";
};

/**
 * Get week day class name
 */
export const getWeekDayClassName = (index: number): string => {
  const base = "text-center text-sm font-medium";
  return index === 0 || index === 6
    ? `${base} text-red-600 dark:text-red-700`
    : `${base} text-gray-700 dark:text-gray-800`;
};

/**
 * Get calendar detail item class name
 */
export const getCalendarDetailItemClassName = (
  isCompleted: boolean,
): string => {
  return `flex items-center gap-2 p-2 rounded ${
    isCompleted
      ? "bg-green-100 dark:bg-green-200"
      : "bg-gray-100 dark:bg-gray-200"
  }`;
};

/**
 * Get calendar detail status icon
 */
export const getCalendarDetailStatusIcon = (isCompleted: boolean): string => {
  return isCompleted ? "✅" : "⬜";
};

/**
 * Format calendar detail rate
 */
export const formatCalendarDetailRate = (
  completedCount: number,
  totalCount: number,
): string => {
  const rate = Math.round((completedCount / totalCount) * 100);

  return `${rate}% (${completedCount}/${totalCount})`;
};

/**
 * Format calendar month label
 */
export const formatCalendarMonthLabel = (year: number, month: number): string =>
  `${year}${texts.monthNavigation.yearSuffix} ${month}${texts.monthNavigation.monthSuffix}`;
