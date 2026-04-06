import texts from "../locales/ja.json";

/**
 * リモートデータの変更を検出したことをデスクトップ通知でユーザーに伝える
 */
export const notifyRemoteChange = (): void => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(texts.syncNotification.title, {
      body: texts.syncNotification.body,
      icon: "/icon-192x192.png",
      tag: "sync-notification",
    });
  }
};
