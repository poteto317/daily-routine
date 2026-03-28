/**
 * Components層のヘルパー関数
 * （テキスト定数だけでなくロジックを含む関数）
 */

import texts from "./locales/ja.json";

/**
 * 進捗率と完了サフィックスを含む進捗ラベルを取得
 */
export const getProgressLabel = (progressPercentage: number): string =>
  `${progressPercentage.toFixed(0)}% ${texts.progressBar.completedSuffix}`;
