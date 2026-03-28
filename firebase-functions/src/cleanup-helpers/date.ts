/**
 * クリーンアップ対象の閾値日付を計算する
 * （1日以上前の通知履歴を削除対象とする）
 */
export const getCleanupThresholdDate = (): Date => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - 1);
  return thresholdDate;
};
