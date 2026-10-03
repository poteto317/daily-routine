import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/https";
import { resolveUidByApiKey } from "./apiKey";
import { createAgentApiHandler } from "./handler";
import type { SyncDocData } from "./operations/types";
import { applyChanges } from "./syncWriter";

/**
 * AI エージェント向け CRUD API（家計簿・ジャーナル）
 * エンドポイント: /agentApi/budget/... , /agentApi/journal/...
 */
export const agentApi = (db: admin.firestore.Firestore) =>
  onRequest(
    { region: "asia-northeast1" },
    createAgentApiHandler({
      resolveUid: (key) => resolveUidByApiKey(db, key),
      readData: async (uid) => {
        const snapshot = await db.collection("users").doc(uid).get();
        return snapshot.exists ? (snapshot.data() as SyncDocData) : null;
      },
      runWrite: (uid, build) =>
        applyChanges(db, uid, build, {
          now: () => Date.now(),
          serverTimestamp: () => admin.firestore.FieldValue.serverTimestamp(),
        }),
      now: () => new Date(),
    }),
  );
