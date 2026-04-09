import { useState } from "react";
import { getFCMToken } from "@/lib/firebase";
import type { NotificationStatus } from "./constants";
import { createNotificationTestActionResult } from "./notificationTestActionResult";
import {
  getDeniedNotificationResult,
  getUnsupportedNotificationResult,
  requestNotificationPermission,
  runNotificationDelivery,
} from "./notificationTestStateActions";

type UseNotificationTestActionParams = {
  startLogCapture: () => void;
};

export const useNotificationTestAction = ({
  startLogCapture,
}: UseNotificationTestActionParams) => {
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationStatus>("idle");
  const [debugMessage, setDebugMessage] = useState<string>("");

  const handleTestNotification = async () => {
    setNotificationStatus("testing");
    setDebugMessage("通知テスト開始...");
    startLogCapture();

    if (!("Notification" in window)) {
      const result = getUnsupportedNotificationResult();
      setDebugMessage(result.debugMessage);
      setNotificationStatus(result.status);
      setTimeout(() => setNotificationStatus("idle"), result.resetDelay);
      return;
    }

    setDebugMessage("通知権限をリクエスト中...");
    const permission = await requestNotificationPermission(Notification);
    setDebugMessage(`通知権限: ${permission}`);

    if (permission !== "granted") {
      const result = getDeniedNotificationResult(permission);
      setDebugMessage(result.debugMessage);
      setNotificationStatus(result.status);
      setTimeout(() => setNotificationStatus("idle"), result.resetDelay);
      return;
    }

    setDebugMessage("FCMトークンを取得中...");
    const result = await runNotificationDelivery({
      getFCMToken,
      serviceWorkerReady: navigator.serviceWorker.ready,
    });

    setDebugMessage(result.debugMessage);
    setNotificationStatus(result.status);

    if (result.clearDebugOnReset) {
      setTimeout(() => {
        setNotificationStatus("idle");
        setDebugMessage("");
      }, result.resetDelay);
      return;
    }

    setTimeout(() => setNotificationStatus("idle"), result.resetDelay);
  };

  return createNotificationTestActionResult({
    notificationStatus,
    debugMessage,
    handleTestNotification,
  });
};
