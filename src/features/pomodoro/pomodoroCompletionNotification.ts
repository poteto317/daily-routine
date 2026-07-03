import { hasNotificationPermission } from "@/features/notification";
import type { TimerState } from "./pomodoroDisplay";
import { POMODORO_NOTIFICATION_TEXT } from "./texts";

export const notifyTimerCompletion = (timerState: TimerState): void => {
  if (!hasNotificationPermission()) {
    return;
  }

  if (timerState === "focus") {
    new Notification(POMODORO_NOTIFICATION_TEXT.focusCompleteTitle, {
      body: POMODORO_NOTIFICATION_TEXT.focusCompleteBody,
      icon: "/icon-192.png",
    });
  }

  if (timerState === "break") {
    new Notification(POMODORO_NOTIFICATION_TEXT.breakCompleteTitle, {
      body: POMODORO_NOTIFICATION_TEXT.breakCompleteBody,
      icon: "/icon-192.png",
    });
  }
};
