import type { Firestore } from "../adminSdk";
import { type Request } from "firebase-functions/https";
import { type Response } from "express";
import * as logger from "firebase-functions/logger";
import { applyCorsHeaders, handlePreflightRequest } from "./cors";
import {
  isPostMethod,
  isValidSyncRequest,
  parseSyncRequestBody,
} from "./request";
import {
  sendInternalServerError,
  sendInvalidSyncRequest,
  sendMethodNotAllowed,
  sendSyncSuccess,
} from "./response";
import { saveUserData } from "./storage";
import { abbreviateTokenForLog } from "../token-log";

/**
 * POST /syncRoutines の処理本体。
 * CORS → メソッド確認 → ボディ検証 → users/{FCM トークン} への保存、の順に処理する。
 */
export const handleSyncRoutinesRequest = async (
  req: Request,
  res: Response,
  db: Firestore,
): Promise<void> => {
  applyCorsHeaders(res);

  if (handlePreflightRequest(req, res)) {
    return;
  }

  if (!isPostMethod(req.method)) {
    sendMethodNotAllowed(res);
    return;
  }

  const requestBody = parseSyncRequestBody(req);

  if (!isValidSyncRequest(requestBody)) {
    sendInvalidSyncRequest(res);
    return;
  }

  const { token, routines } = requestBody;

  try {
    await saveUserData(db, token, routines);

    logger.info(
      `Synced ${routines.length} routines for token: ${abbreviateTokenForLog(token)}`,
    );

    sendSyncSuccess(res, routines.length);
  } catch (error) {
    logger.error("Sync error:", error);
    sendInternalServerError(res);
  }
};
