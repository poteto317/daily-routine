import { Request } from "firebase-functions/https";
import { Response } from "express";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
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

export const handleSyncRoutinesRequest = async (
  req: Request,
  res: Response,
  db: admin.firestore.Firestore,
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
      `Synced ${routines.length} routines for token: ${token.substring(0, 20)}...`,
    );

    sendSyncSuccess(res, routines.length);
  } catch (error) {
    logger.error("Sync error:", error);
    sendInternalServerError(res);
  }
};
