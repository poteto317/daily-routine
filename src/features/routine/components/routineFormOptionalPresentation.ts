import texts from "../locales/ja.json";

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
export const ROUTINE_FORM_WEEKLY_GOAL_LABEL =
  texts.routineFormOptional.weeklyGoalLabel;
export const ROUTINE_FORM_WEEKLY_GOAL_PLACEHOLDER =
  texts.routineFormOptional.weeklyGoalPlaceholder;
export const ROUTINE_FORM_WEEKLY_GOAL_HINT =
  texts.routineFormOptional.weeklyGoalHint;
export const ROUTINE_FORM_WEEKLY_GOAL_ERROR =
  texts.routineFormOptional.weeklyGoalError;

export const getRoutineNotificationPlaceholder = (
  defaultNotificationMinutes: number,
): string =>
  defaultNotificationMinutes === 0
    ? "デフォルト: 通知なし"
    : `デフォルト: ${defaultNotificationMinutes}分`;
