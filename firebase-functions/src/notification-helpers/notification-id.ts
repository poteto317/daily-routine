/**
 * FCMトークン・ルーティンID・日付から通知の重複送信防止用IDを生成する（純粋関数）
 */
export const createNotificationId = (
  fcmToken: string,
  routineId: string,
  todayStr: string,
): string => {
  return `${fcmToken}_${routineId}_${todayStr}`;
};
