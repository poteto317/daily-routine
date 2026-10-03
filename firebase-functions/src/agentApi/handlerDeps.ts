import type { OperationOutcome } from "./operations/types";
import type { SyncDocData } from "./syncDoc";

/** ハンドラが外部（Firestore・時計）に依存する部分。テストでは差し替える */
export type HandlerDeps = {
  resolveUid: (key: string) => Promise<string | null>;
  readData: (uid: string) => Promise<SyncDocData | null>;
  runWrite: (
    uid: string,
    build: (data: SyncDocData) => OperationOutcome,
  ) => Promise<OperationOutcome>;
  now: () => Date;
};
