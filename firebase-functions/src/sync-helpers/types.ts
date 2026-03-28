/**
 * sync-helpers 内で使用する型定義
 */
export type SyncRequestBody = {
  token?: string;
  routines?: unknown[];
};

export type ValidSyncRequestBody = {
  token: string;
  routines: unknown[];
};
