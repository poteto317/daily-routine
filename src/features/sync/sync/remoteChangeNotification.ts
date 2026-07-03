import texts from "../locales/ja.json";

/**
 * リモートデータの変更を検出したことをデスクトップ通知でユーザーに伝える
 */
export const notifyRemoteChange = (): void => {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(texts.syncNotification.title, {
      body: texts.syncNotification.body,
      icon: "/icon-192.png",
      tag: "sync-notification",
    });
  } catch {
    // 通知生成に失敗しても呼び出し元（watchRemote の snapshot ハンドラ）を例外で落とさない
  }
};
