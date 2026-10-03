export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (what: string): ApiError =>
  new ApiError(404, "not_found", `${what}が見つかりません`);

/** 同期データ（users/{uid}）が未作成のとき。先にアプリからのアップロードが必要 */
export const noSyncData = (): ApiError =>
  new ApiError(
    404,
    "no_sync_data",
    "同期データがありません。先にアプリからクラウドへアップロードしてください",
  );

/** 更新リクエストに更新対象のフィールドが 1 つも無いとき */
export const emptyPatch = (): ApiError =>
  new ApiError(400, "empty_patch", "更新するフィールドを指定してください");
