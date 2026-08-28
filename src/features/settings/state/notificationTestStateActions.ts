import type { NotificationStatus } from "./constants";

type NotificationTestResult = {
  status: NotificationStatus;
  debugMessage: string;
  resetDelay: number;
  clearDebugOnReset: boolean;
};

type ServiceWorkerMessageEvent = {
  data?: {
    type?: string;
    message?: string;
  };
};

type ServiceWorkerContainerLike = {
  addEventListener?: (
    type: "message",
    listener: (event: ServiceWorkerMessageEvent) => void,
  ) => void;
};

type NotificationRegistrationLike = {
  showNotification: (
    title: string,
    options: {
      body: string;
      tag: string;
      icon: string;
      badge: string;
    },
  ) => Promise<void>;
};

type RunNotificationDeliveryArgs = {
  getFCMToken: () => Promise<string | null>;
  serviceWorkerReady: Promise<NotificationRegistrationLike>;
};

export const appendNotificationSwLog = (
  swLogs: string[],
  timestamp: string,
  message: string,
): string[] => {
  return [...swLogs.slice(-19), `${timestamp}: ${message}`];
};

export const captureNotificationLogs = (
  serviceWorker: ServiceWorkerContainerLike | undefined,
  onLog: (message: string) => void,
): void => {
  serviceWorker?.addEventListener?.("message", (event) => {
    if (event.data?.type !== "SW_LOG" || !event.data.message) {
      return;
    }

    onLog(event.data.message);
  });
};

export const getUnsupportedNotificationResult = (): NotificationTestResult => {
  return {
    status: "error",
    debugMessage: "エラー: 通知APIがサポートされていません",
    resetDelay: 3000,
    clearDebugOnReset: false,
  };
};

export const getDeniedNotificationResult = (
  permission: NotificationPermission,
): NotificationTestResult => {
  return {
    status: "error",
    debugMessage: `エラー: 通知権限が拒否されました (${permission})`,
    resetDelay: 5000,
    clearDebugOnReset: false,
  };
};

export const getMissingTokenResult = (): NotificationTestResult => {
  return {
    status: "error",
    debugMessage: "エラー: FCMトークンの取得に失敗しました",
    resetDelay: 5000,
    clearDebugOnReset: false,
  };
};

export const getNotificationSuccessResult = (): NotificationTestResult => {
  return {
    status: "success",
    debugMessage: "✓ テスト通知送信完了 - 通知が正常に動作しています",
    resetDelay: 5000,
    clearDebugOnReset: true,
  };
};

export const getNotificationRuntimeErrorResult = (): NotificationTestResult => {
  return {
    status: "error",
    debugMessage:
      "エラー: 通信エラーが発生しました。電波の良い場所で再度お試しください",
    resetDelay: 5000,
    clearDebugOnReset: true,
  };
};

export const runNotificationDelivery = async ({
  getFCMToken,
  serviceWorkerReady,
}: RunNotificationDeliveryArgs): Promise<NotificationTestResult> => {
  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      return getMissingTokenResult();
    }

    const registration = await serviceWorkerReady;
    await registration.showNotification("🎉 通知テスト", {
      body: "バックグラウンド通知が有効になりました！",
      tag: "test-notification",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });

    return getNotificationSuccessResult();
  } catch {
    return getNotificationRuntimeErrorResult();
  }
};

export type { NotificationTestResult, ServiceWorkerContainerLike };
