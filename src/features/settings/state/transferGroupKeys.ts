/**
 * エクスポート・インポートのグループ。並び順はチェックボックスの表示順になる。
 *
 * 他に何も依存しないファイルに置く。型と既定値、グループ定義表の三者が
 * ここを参照するため、どこか 1 つに同居させると循環参照になる。
 */
export const TRANSFER_GROUP_KEYS = [
  "routines",
  "progress",
  "history",
  "settings",
  "records",
  "todoLists",
  "budget",
  "presets",
] as const;

export type TransferGroupKey = (typeof TRANSFER_GROUP_KEYS)[number];
