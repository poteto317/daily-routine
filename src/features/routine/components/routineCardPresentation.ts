import type { Routine } from "@/types/routine";
import texts from "../locales/ja.json";

export const ROUTINE_CARD_CONTENT_TEXT = texts.routineCard;

export const getDurationLabel = (minutes: number): string =>
  `${ROUTINE_CARD_CONTENT_TEXT.durationEmoji} ${minutes}${ROUTINE_CARD_CONTENT_TEXT.durationUnit}`;

export const getNotificationLabel = (minutes: number): string =>
  `${ROUTINE_CARD_CONTENT_TEXT.notificationEmoji} ${minutes}${ROUTINE_CARD_CONTENT_TEXT.notificationSuffix}`;

export const getWeeklyGoalLabel = (targetPerWeek: number): string =>
  `${ROUTINE_CARD_CONTENT_TEXT.weeklyGoalPrefix}${targetPerWeek}${ROUTINE_CARD_CONTENT_TEXT.weeklyGoalSuffix}`;

export const getRoutineTitleClassName = (
  routine: Routine,
  showDuration: boolean,
): string => {
  if (showDuration) {
    return routine.isCompleted
      ? "text-lg font-medium mt-1 text-gray-500 dark:text-gray-600 line-through"
      : "text-lg font-medium mt-1 text-gray-900 dark:text-gray-900";
  }

  return routine.isCompleted
    ? "text-base font-semibold break-all line-through text-gray-400 dark:text-gray-600"
    : "text-base font-semibold break-all text-gray-900 dark:text-black";
};
