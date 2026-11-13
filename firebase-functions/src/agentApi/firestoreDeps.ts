import type { Firestore } from "../adminSdk";
import { USERS_COLLECTION } from "../constants";
import { resolveUidByApiKey } from "./apiKeyLookup";
import type { HandlerDeps } from "./handlerDeps";
import type { SyncDocData } from "./syncDoc";
import { applyChanges, type WriteDeps } from "./syncWriter";

/** Firestore に接続する HandlerDeps を作る。時計とサーバー時刻は引数で差し替えられる */
export const createFirestoreHandlerDeps = (
  db: Firestore,
  writeDeps: WriteDeps,
): HandlerDeps => ({
  resolveUid: (key) => resolveUidByApiKey(db, key),
  readData: async (uid) => {
    const snapshot = await db.collection(USERS_COLLECTION).doc(uid).get();
    return snapshot.exists ? (snapshot.data() as SyncDocData) : null;
  },
  runWrite: (uid, build) => applyChanges(db, uid, build, writeDeps),
  now: () => new Date(writeDeps.now()),
});
