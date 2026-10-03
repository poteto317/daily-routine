import type { Response } from "express";
import * as logger from "firebase-functions/logger";
import { ApiError } from "./errors";

/** エラー応答の形式 `{ error: { code, message } }` で返す */
export const sendError = (res: Response, error: ApiError): void => {
  res
    .status(error.status)
    .json({ error: { code: error.code, message: error.message } });
};

/**
 * 捕捉したエラーを応答に変換する。
 * ApiError はそのまま返し、想定外のエラーは詳細をログにだけ残して 500 にする。
 */
export const respondWithError = (res: Response, error: unknown): void => {
  if (error instanceof ApiError) {
    sendError(res, error);
    return;
  }
  logger.error("agentApi error:", error);
  sendError(
    res,
    new ApiError(500, "internal_error", "サーバーエラーが発生しました"),
  );
};
