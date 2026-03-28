import type { NotificationStatus } from "./constants";

type NotificationTestActionResultArgs = {
  notificationStatus: NotificationStatus;
  debugMessage: string;
  handleTestNotification: () => Promise<void>;
};

export const createNotificationTestActionResult = ({
  notificationStatus,
  debugMessage,
  handleTestNotification,
}: NotificationTestActionResultArgs) => {
  return {
    notificationStatus,
    debugMessage,
    handleTestNotification,
  };
};
