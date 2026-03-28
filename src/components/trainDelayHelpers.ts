/**
 * TrainDelayNotification コンポーネント用のヘルパー関数
 */

import texts from "./locales/ja.json";

/**
 * 遅延分数に応じた遅延レベルのCSSクラスを取得
 */
export const getDelaySeverityColorClass = (delayMinutes: number): string => {
  if (delayMinutes >= 30)
    return "bg-red-100 dark:bg-red-200 border-red-400 dark:border-red-500";

  if (delayMinutes >= 15)
    return "bg-orange-100 dark:bg-orange-200 border-orange-400 dark:border-orange-500";

  return "bg-yellow-100 dark:bg-yellow-200 border-yellow-400 dark:border-yellow-500";
};

/**
 * 遅延分数に応じた遅延レベルのアイコンを取得
 */
export const getDelaySeverityIcon = (delayMinutes: number): string => {
  if (delayMinutes >= 30) return "🚨";

  if (delayMinutes >= 15) return "⚠️";

  return "ℹ️";
};

/**
 * 遅延表示用の最終更新時刻を整形
 */
export const formatDelayLastUpdatedTime = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 遅延分数テキストを取得
 */
export const getDelayMinutesText = (delayMinutes: number): string => {
  return texts.trainDelay.delayMinutesTemplate.replace(
    "{minutes}",
    String(delayMinutes),
  );
};

/**
 * 遅延理由テキストを取得
 */
export const getDelayReasonText = (reason: string): string => {
  return texts.trainDelay.delayReasonTemplate.replace("{reason}", reason);
};
