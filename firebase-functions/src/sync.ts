import { onRequest } from "firebase-functions/https";
import type * as admin from "firebase-admin";
import { handleSyncRoutinesRequest } from "./sync-helpers";

/**
 * ルーティンと FCM トークンを Firestore に保存
 * エンドポイント: POST /syncRoutines
 */
export const syncRoutines = (db: admin.firestore.Firestore) =>
  onRequest({ region: "asia-northeast1" }, async (req, res) => {
    await handleSyncRoutinesRequest(req, res, db);
  });
