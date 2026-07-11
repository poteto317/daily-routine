/**
 * プッシュ通知で使用するテキスト定義
 */
export const NOTIFICATION_TEXTS = {
  title: "ルーティンのリマインダー",
  body: (routineTitle: string) => `"${routineTitle}" の時間です`,
  icon: "/icon-192.png",
  badge: "/icon-192.png",
} as const;
