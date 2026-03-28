import texts from "./locales/ja.json";

// Re-export from sub-helpers
export {
  isRoutinePast,
  getCategoryInfo,
  getRoutineCardStyle,
  createSwipeHandler,
} from "./helpersPresentation";
export {
  getRoutinesNeedingNotification,
  sendBrowserNotification,
} from "./helpersNotification";
export { syncRoutinesToFirebase } from "./helpersSync";

// ===============================
// Routine Notification
// ===============================
export const ROUTINE_NOTIFICATION_MESSAGES = {
  title: texts.notification.title,
} as const;

export const getRoutineNotificationBody = (routineTitle: string): string => {
  return texts.notification.bodyTemplate.replace("{routineTitle}", routineTitle);
};
