import { type Routine } from "@/types/routine";
import { type NotificationStatus } from "../state/constants";

type NotificationButtonViewModel = {
  disabled: boolean;
  className: string;
  label: string;
};

export const getNotificationButtonViewModel = (
  status: NotificationStatus,
): NotificationButtonViewModel => {
  if (status === "testing") {
    return {
      disabled: true,
      className: "bg-gray-400 text-white cursor-wait",
      label: "🔔 テスト中...",
    };
  }

  if (status === "success") {
    return {
      disabled: false,
      className: "bg-green-600 text-white",
      label: "✓ 通知が送信されました！",
    };
  }

  if (status === "error") {
    return {
      disabled: false,
      className: "bg-red-600 text-white",
      label: "✗ 通知の許可が必要です",
    };
  }

  return {
    disabled: false,
    className: "bg-blue-600 text-white hover:bg-blue-700",
    label: "🔔 通知をテスト",
  };
};

export const getDebugMessageClassName = (
  status: NotificationStatus,
): string => {
  if (status === "error") {
    return "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
  }

  return "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
};

export const getRoutineNotificationCounts = (routines: Routine[]) => {
  return {
    totalRoutines: routines.length,
    activeNotificationRoutines: routines.filter(
      (routine) => routine.notificationMinutes,
    ).length,
  };
};
