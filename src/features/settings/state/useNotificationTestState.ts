import { useNotificationLogState } from "./useNotificationLogState";
import { createNotificationTestStateResult } from "./notificationTestStateResult";
import { useNotificationTestAction } from "./useNotificationTestAction";

export const useNotificationTestState = () => {
  const { swLogs, startLogCapture, clearLogs } = useNotificationLogState();
  const { notificationStatus, debugMessage, handleTestNotification } =
    useNotificationTestAction({ startLogCapture });

  return createNotificationTestStateResult({
    notificationStatus,
    debugMessage,
    swLogs,
    clearLogs,
    handleTestNotification,
  });
};
