import { useState } from "react";
import {
  appendNotificationSwLog,
  captureNotificationLogs,
} from "./notificationTestStateActions";
import { createNotificationLogStateResult } from "./notificationLogStateResult";

export const useNotificationLogState = () => {
  const [swLogs, setSwLogs] = useState<string[]>([]);

  const startLogCapture = () => {
    if (typeof window === "undefined") {
      return;
    }

    captureNotificationLogs(navigator.serviceWorker, (message) => {
      setSwLogs((prev) =>
        appendNotificationSwLog(prev, new Date().toLocaleTimeString(), message),
      );
    });
  };

  const clearLogs = () => {
    setSwLogs([]);
  };

  return createNotificationLogStateResult({
    swLogs,
    startLogCapture,
    clearLogs,
  });
};
