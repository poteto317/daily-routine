import texts from "../locales/ja.json";

export const ROUTINE_FORM_START_TIME_LABEL =
  texts.routineFormTime.startTimeLabel;
export const ROUTINE_FORM_DURATION_LABEL = texts.routineFormTime.durationLabel;
export const ROUTINE_FORM_CONFLICT_TITLE = texts.routineFormTime.conflictTitle;
export const ROUTINE_FORM_DURATION_CONFLICT_LABEL =
  texts.routineFormTime.durationConflictLabel;
export const ROUTINE_FORM_DURATION_HINT_PREFIX =
  texts.routineFormTime.durationHintPrefix;
export const ROUTINE_FORM_DURATION_HINT_SUFFIX =
  texts.routineFormTime.durationHintSuffix;
export const ROUTINE_DAY_NAMES = texts.routineFormTime.dayNames;

export const getRoutineTimeInputClassName = (hasConflict: boolean): string =>
  `w-full px-3 py-2 border rounded-lg focus:ring-2 dark:bg-white dark:text-gray-900 transition-all ${
    hasConflict
      ? "border-red-500 focus:ring-red-500 animate-shake bg-red-50 dark:bg-red-100"
      : "border-gray-300 dark:border-gray-400 focus:ring-blue-500"
  }`;

export const getRoutineDurationInputClassName = (
  hasConflict: boolean,
): string =>
  `w-full px-3 py-2 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-gray-100 transition-all ${
    hasConflict
      ? "border-red-500 focus:ring-red-500 animate-shake bg-red-50 dark:bg-red-900/20"
      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
  }`;

export const getRoutineDurationPlaceholder = (
  defaultDurationMinutes: number,
): string => `デフォルト: ${defaultDurationMinutes}分`;

export const getRoutineDayNameLabel = (
  dayIndex: number,
  dayNames: string[],
): string => dayNames[dayIndex] ?? "";

export const formatConflictRoutineLabel = (
  title: string,
  commonDays: number[],
): string => {
  const dayLabels = commonDays
    .map((day) => getRoutineDayNameLabel(day, ROUTINE_DAY_NAMES))
    .join(", ");
  return `「${title}」(${dayLabels})`;
};
