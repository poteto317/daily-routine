import type { Firestore } from "./adminSdk";
import { onRequest } from "firebase-functions/https";
import { handleSyncRoutinesRequest } from "./sync-helpers";

/**
 * 本人確認したルーティンの通知設定を Firestore に保存
 * エンドポイント: POST /syncRoutines
 */
export const syncRoutines = (db: Firestore) =>
  onRequest({ region: "asia-northeast1" }, async (req, res) => {
    await handleSyncRoutinesRequest(req, res, db);
  });
