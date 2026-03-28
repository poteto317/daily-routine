import type { NotificationStatus } from "./constants";

type NotificationTestStateResultArgs = {
  clearLogs: () => void;
  debugMessage: string;
  handleTestNotification: () => Promise<void>;
  notificationStatus: NotificationStatus;
  swLogs: string[];
};

export const createNotificationTestStateResult = ({
  clearLogs,
  debugMessage,
  handleTestNotification,
  notificationStatus,
  swLogs,
}: NotificationTestStateResultArgs) => {
  return {
    notificationStatus,
    debugMessage,
    swLogs,
    clearLogs,
    handleTestNotification,
  };
};
