import type { Firestore } from "../adminSdk";
import { FieldValue } from "../adminSdk";
import { onRequest } from "firebase-functions/https";
import { createFirestoreHandlerDeps } from "./firestoreDeps";
import { createAgentApiHandler } from "./handler";

/**
 * AI エージェント向け CRUD API（家計簿・ジャーナル）
 * エンドポイント: /agentApi/budget/... , /agentApi/journal/...
 */
export const agentApi = (db: Firestore) =>
  onRequest(
    { region: "asia-northeast1" },
    createAgentApiHandler(
      createFirestoreHandlerDeps(db, {
        now: () => Date.now(),
        serverTimestamp: () => FieldValue.serverTimestamp(),
      }),
    ),
  );
