import type { Firestore } from "../adminSdk";
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import * as logger from "firebase-functions/logger";
import { verifySyncUser } from "./authenticate";
import { applyCorsHeaders, handlePreflightRequest } from "./cors";
import { isPostMethod, parseSyncRequestBody } from "./request";
import {
  sendInternalServerError,
  sendInvalidSyncRequest,
  sendMethodNotAllowed,
  sendSubscriptionOwnerMismatch,
  sendSyncSuccess,
  sendUnauthorizedSyncRequest,
} from "./response";
import { saveNotificationSubscription } from "./storage";

/** Firebase Auth で確認した本人の端末登録だけを更新する。 */
export const handleSyncRoutinesRequest = async (
  req: Request,
  res: Response,
  db: Firestore,
): Promise<void> => {
  applyCorsHeaders(res);
  if (handlePreflightRequest(req, res)) return;

  if (!isPostMethod(req.method)) {
    sendMethodNotAllowed(res);
    return;
  }

  const ownerUid = await verifySyncUser(req.headers.authorization);
  if (!ownerUid) {
    sendUnauthorizedSyncRequest(res);
    return;
  }

  const parsed = parseSyncRequestBody(req);
  if (!parsed.success) {
    sendInvalidSyncRequest(res);
    return;
  }

  const { token, routines } = parsed.data;
  try {
    if (!(await saveNotificationSubscription(db, ownerUid, token, routines))) {
      sendSubscriptionOwnerMismatch(res);
      return;
    }

    logger.info("Notification routines synced", {
      routinesCount: routines.length,
    });
    sendSyncSuccess(res, routines.length);
  } catch {
    logger.error("Notification subscription sync failed");
    sendInternalServerError(res);
  }
};
