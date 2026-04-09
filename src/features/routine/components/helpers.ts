import texts from "../locales/ja.json";
import { type Routine } from "@/types/routine";

// ===============================
// Routine Card Content
// ===============================
export const ROUTINE_CARD_CONTENT_TEXT = texts.routineCard;

export const getDurationLabel = (minutes: number): string =>
  `${ROUTINE_CARD_CONTENT_TEXT.durationEmoji} ${minutes}${ROUTINE_CARD_CONTENT_TEXT.durationUnit}`;

export const getNotificationLabel = (minutes: number): string =>
  `${ROUTINE_CARD_CONTENT_TEXT.notificationEmoji} ${minutes}${ROUTINE_CARD_CONTENT_TEXT.notificationSuffix}`;

export const getRoutineTitleClassName = (
  routine: Routine,
  showDuration: boolean,
): string => {
  if (showDuration)
    return routine.isCompleted
      ? "text-lg font-medium mt-1 text-gray-500 dark:text-gray-600 line-through"
      : "text-lg font-medium mt-1 text-gray-900 dark:text-gray-900";

  return routine.isCompleted
    ? "text-base font-semibold break-all line-through text-gray-400 dark:text-gray-600"
    : "text-base font-semibold break-all text-gray-900 dark:text-black";
};

// ===============================
// Routine Item Action Buttons
// ===============================
export const ROUTINE_ITEM_ACTION_BUTTONS_TEXT = texts.routineItemActions;

// ===============================
// Sortable Routine Item
// ===============================
export const shouldUseSwipeOnlyRoutineItem = (isEditMode: boolean): boolean => {
  return !isEditMode;
};

// ===============================
// Routine Item
// ===============================
export const ROUTINE_ITEM_EDIT_LABEL = texts.routineItemActions.editLabel;
export const ROUTINE_ITEM_DELETE_LABEL = texts.routineItemActions.deleteLabel;

// ===============================
// Routine Form Header
// ===============================
export const ROUTINE_FORM_HEADER_TEXT = texts.routineFormHeader;

export const getRoutineFormHeaderTitle = (isEditMode: boolean): string =>
  isEditMode
    ? ROUTINE_FORM_HEADER_TEXT.editTitle
    : ROUTINE_FORM_HEADER_TEXT.newTitle;

// ===============================
// Routine Form Core
// ===============================
export const ROUTINE_FORM_TITLE_LABEL = texts.routineFormCore.titleLabel;
export const ROUTINE_FORM_TITLE_PLACEHOLDER =
  texts.routineFormCore.titlePlaceholder;
export const ROUTINE_FORM_DAYS_LABEL = texts.routineFormCore.daysLabel;
export const ROUTINE_FORM_CATEGORY_LABEL = texts.routineFormCore.categoryLabel;
export const ROUTINE_FORM_DAYS_WARNING_LABEL =
  texts.routineFormCore.daysWarningLabel;
export const ROUTINE_FORM_DAYS_EDIT_HINT = texts.routineFormCore.daysEditHint;
export const ROUTINE_FORM_DAYS_CREATE_HINT =
  texts.routineFormCore.daysCreateHint;

export const getRoutineDayButtonClassName = (params: {
  isSelected: boolean;
  isHoliday: boolean;
}): string => {
  const { isSelected, isHoliday } = params;

  if (isSelected && isHoliday)
    return "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-red-600 text-white shadow-md";

  if (isSelected)
    return "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-blue-600 text-white shadow-md";

  return "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-white text-gray-700 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-50";
};

export const getRoutineCategoryButtonClassName = (
  categoryValue: string,
  selectedCategory: string,
  activeColorClass: string,
): string => {
  return categoryValue === selectedCategory
    ? `px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeColorClass} ring-2 ring-blue-500`
    : "px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-white text-gray-700 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-50";
};

// ===============================
// Routine Form Time
// ===============================
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

export const getRoutineTimeInputClassName = (hasConflict: boolean): string => {
  return `w-full px-3 py-2 border rounded-lg focus:ring-2 dark:bg-white dark:text-gray-900 transition-all ${
    hasConflict
      ? "border-red-500 focus:ring-red-500 animate-shake bg-red-50 dark:bg-red-100"
      : "border-gray-300 dark:border-gray-400 focus:ring-blue-500"
  }`;
};

export const getRoutineDurationInputClassName = (
  hasConflict: boolean,
): string => {
  return `w-full px-3 py-2 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-gray-100 transition-all ${
    hasConflict
      ? "border-red-500 focus:ring-red-500 animate-shake bg-red-50 dark:bg-red-900/20"
      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
  }`;
};

export const getRoutineDurationPlaceholder = (
  defaultDurationMinutes: number,
): string => {
  return `デフォルト: ${defaultDurationMinutes}分`;
};

export const getRoutineDayNameLabel = (
  dayIndex: number,
  dayNames: string[],
): string => {
  return dayNames[dayIndex] ?? "";
};

export const ROUTINE_DAY_NAMES = texts.routineFormTime.dayNames;

export const formatConflictRoutineLabel = (
  title: string,
  commonDays: number[],
): string => {
  const dayLabels = commonDays
    .map((day) => getRoutineDayNameLabel(day, ROUTINE_DAY_NAMES))
    .join(", ");
  return `「${title}」(${dayLabels})`;
};

// ===============================
// Routine Form Optional
// ===============================
export const ROUTINE_FORM_DESCRIPTION_LABEL =
  texts.routineFormOptional.descriptionLabel;
export const ROUTINE_FORM_DESCRIPTION_PLACEHOLDER =
  texts.routineFormOptional.descriptionPlaceholder;
export const ROUTINE_FORM_NOTIFICATION_LABEL =
  texts.routineFormOptional.notificationLabel;
export const ROUTINE_FORM_NOTIFICATION_BETA =
  texts.routineFormOptional.notificationBeta;
export const ROUTINE_FORM_NOTIFICATION_HINT_PREFIX =
  texts.routineFormOptional.notificationHintPrefix;
export const ROUTINE_FORM_NOTIFICATION_HINT_SUFFIX =
  texts.routineFormOptional.notificationHintSuffix;
export const ROUTINE_FORM_NOTIFICATION_PERMISSION_HINT =
  texts.routineFormOptional.notificationPermissionHint;

export const getRoutineNotificationPlaceholder = (
  defaultNotificationMinutes: number,
): string => {
  if (defaultNotificationMinutes === 0) {
    return "デフォルト: 通知なし";
  }
  return `デフォルト: ${defaultNotificationMinutes}分`;
};

// ===============================
// Routine Form Footer
// ===============================
export const ROUTINE_FORM_FOOTER_TEXT = texts.routineFormFooter;

export const getRoutineFormSubmitLabel = (isEditMode: boolean): string =>
  isEditMode ? ROUTINE_FORM_FOOTER_TEXT.update : ROUTINE_FORM_FOOTER_TEXT.add;

export const getSubmitButtonClassName = (isDisabled: boolean): string => {
  const base = "flex-1 px-4 py-2 rounded-lg transition-colors";
  return isDisabled
    ? `${base} bg-gray-400 text-gray-200 cursor-not-allowed`
    : `${base} bg-blue-600 text-white hover:bg-blue-700`;
};
