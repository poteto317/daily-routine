import { Request } from "firebase-functions/https";
import type { SyncRequestBody, ValidSyncRequestBody } from "./types";

export const parseSyncRequestBody = (req: Request): SyncRequestBody => {
  return req.body ?? {};
};

export const isPostMethod = (method: string): boolean => {
  return method === "POST";
};

export const isValidSyncRequest = (
  body: SyncRequestBody,
): body is ValidSyncRequestBody => {
  return (
    typeof body.token === "string" &&
    body.token.length > 0 &&
    Array.isArray(body.routines)
  );
};
