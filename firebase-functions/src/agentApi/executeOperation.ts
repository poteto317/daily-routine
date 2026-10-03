import { noSyncData } from "./errors";
import type { HandlerDeps } from "./handlerDeps";
import { RESOURCE_OPERATIONS } from "./operations";
import type { OperationContext, OperationOutcome } from "./operations/types";
import type { RouteMatch } from "./router";

export type OperationRequest = Omit<OperationContext, "data">;

/**
 * ルートに対応する操作を実行する。
 * 一覧は読み取りのみ、それ以外はトランザクション経由で書き込む。
 */
export const executeOperation = async (
  deps: HandlerDeps,
  uid: string,
  route: RouteMatch,
  request: OperationRequest,
): Promise<OperationOutcome> => {
  const operation = RESOURCE_OPERATIONS[route.resource][route.action];

  if (route.action === "list") {
    const data = await deps.readData(uid);
    if (!data) throw noSyncData();
    return operation({ ...request, data });
  }

  return deps.runWrite(uid, (data) => operation({ ...request, data }));
};
