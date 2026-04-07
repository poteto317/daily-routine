import texts from "../locales/ja.json";

/**
 * リモートデータの変更を検出したことをデスクトップ通知でユーザーに伝える
 */
export const notifyRemoteChange = (): void => {
  if (typeof window === "undefined") return;
  const NotificationAPI = window.Notification;
  if (NotificationAPI && NotificationAPI.permission === "granted") {
    new NotificationAPI(texts.syncNotification.title, {
      body: texts.syncNotification.body,
      icon: "/icon-192x192.png",
      tag: "sync-notification",
    });
  }
};
