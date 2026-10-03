import type { SyncDocData } from "../syncDoc";
import type { OperationOutcome } from "./types";

/** 200 OK。changes があれば同期ドキュメントへ書き込まれる */
export const okOutcome = (
  body: unknown,
  changes?: SyncDocData,
): OperationOutcome =>
  changes ? { status: 200, body, changes } : { status: 200, body };

/** 201 Created（作成系の応答） */
export const createdOutcome = (
  body: unknown,
  changes: SyncDocData,
): OperationOutcome => ({ status: 201, body, changes });

/** 削除の応答 `{ deleted: id }`（200 OK） */
export const deletedOutcome = (
  id: string | undefined,
  changes: SyncDocData,
): OperationOutcome => ({ status: 200, body: { deleted: id }, changes });
