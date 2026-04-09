import type { MealType } from "@/types/routine";
import mealTexts from "./locales/ja.json";

/**
 * Meal page messages and helpers
 */

// Page messages
export const MEAL_PAGE_MESSAGES = {
  alertMissingContent: mealTexts.page.alertMissingContent,
  confirmDeleteMeal: (date: string) =>
    mealTexts.page.confirmDeleteMealTemplate.replace("{date}", date),
} as const;

// Header text
export const MEAL_HEADER_TEXT = {
  title: mealTexts.header.title,
  badge: mealTexts.header.badge,
  info: mealTexts.header.info,
} as const;

// Today section
export const MEAL_TODAY_TITLE_LABEL = mealTexts.todaySection.titleLabel;
export const MEAL_TODAY_ADD_LABEL = mealTexts.todaySection.addLabel;
export const MEAL_TODAY_NOTES_PREFIX = mealTexts.todaySection.notesPrefix;
export const MEAL_TODAY_DELETE_LABEL = mealTexts.todaySection.deleteLabel;
export const MEAL_TODAY_EMPTY_LABEL = mealTexts.todaySection.emptyLabel;

export const formatMealNotes = (notes: string): string => {
  return `${MEAL_TODAY_NOTES_PREFIX} ${notes}`;
};

// Input form
export const MEAL_TYPE_LABEL = mealTexts.inputForm.typeLabel;
export const MEAL_TIME_LABEL = mealTexts.inputForm.timeLabel;
export const MEAL_DESCRIPTION_LABEL = mealTexts.inputForm.descriptionLabel;
export const MEAL_NOTES_LABEL = mealTexts.inputForm.notesLabel;
export const MEAL_DESCRIPTION_PLACEHOLDER =
  mealTexts.inputForm.descriptionPlaceholder;
export const MEAL_NOTES_PLACEHOLDER = mealTexts.inputForm.notesPlaceholder;
export const MEAL_SAVE_LABEL = mealTexts.inputForm.saveLabel;
export const MEAL_CANCEL_LABEL = mealTexts.inputForm.cancelLabel;

type MealTypeOption = {
  value: MealType;
  label: string;
};

export const MEAL_TYPE_OPTIONS: MealTypeOption[] = mealTexts.inputForm
  .typeOptions as MealTypeOption[];

// Recent section
export const MEAL_RECENT_TITLE = mealTexts.recentSection.title;
export const MEAL_RECENT_EMPTY_LABEL = mealTexts.recentSection.emptyLabel;
export const MEAL_RECENT_TODAY_BADGE = mealTexts.recentSection.todayBadge;
export const MEAL_RECENT_DELETE_LABEL = mealTexts.recentSection.deleteLabel;
export const MEAL_RECENT_MEMO_PREFIX = mealTexts.recentSection.memoPrefix;

export const getMealRecentItemClassName = (isToday: boolean): string => {
  return `p-4 border rounded-lg hover:shadow-md transition-shadow ${
    isToday
      ? "border-green-300 dark:border-green-400 bg-green-50 dark:bg-green-100"
      : "border-gray-200 dark:border-gray-300"
  }`;
};

export const formatMealRecentMemo = (notes: string): string => {
  return `${MEAL_RECENT_MEMO_PREFIX} ${notes}`;
};
