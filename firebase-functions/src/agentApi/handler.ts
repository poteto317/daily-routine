import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import * as logger from "firebase-functions/logger";
import { extractBearerToken } from "./apiKey";
import { ApiError } from "./errors";
import { RESOURCE_OPERATIONS } from "./operations";
import type { OperationOutcome, SyncDocData } from "./operations/types";
import { matchRoute } from "./router";

export type HandlerDeps = {
  resolveUid: (key: string) => Promise<string | null>;
  readData: (uid: string) => Promise<SyncDocData | null>;
  runWrite: (
    uid: string,
    build: (data: SyncDocData) => OperationOutcome,
  ) => Promise<OperationOutcome>;
  now: () => Date;
};

const unauthorized = (): ApiError =>
  new ApiError(401, "unauthorized", "API キーが無効です");

const toStringQuery = (query: Request["query"]): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      typeof value === "string" ? value : undefined,
    ]),
  );

const sendError = (res: Response, error: ApiError): void => {
  res
    .status(error.status)
    .json({ error: { code: error.code, message: error.message } });
};

export const createAgentApiHandler =
  (deps: HandlerDeps) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = extractBearerToken(req.headers.authorization);
      if (!key) throw unauthorized();
      const uid = await deps.resolveUid(key);
      if (!uid) throw unauthorized();

      const { resource, action, id } = matchRoute(req.method, req.path);
      const operation = RESOURCE_OPERATIONS[resource][action];
      const base = {
        id,
        query: toStringQuery(req.query),
        body: req.body,
        now: deps.now(),
      };

      let outcome: OperationOutcome;
      if (action === "list") {
        const data = await deps.readData(uid);
        if (!data) {
          throw new ApiError(
            404,
            "no_sync_data",
            "同期データがありません。先にアプリからクラウドへアップロードしてください",
          );
        }
        outcome = operation({ ...base, data });
      } else {
        outcome = await deps.runWrite(uid, (data) =>
          operation({ ...base, data }),
        );
      }

      res.status(outcome.status).json(outcome.body);
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error);
        return;
      }
      logger.error("agentApi error:", error);
      sendError(res, new ApiError(500, "internal_error", "サーバーエラーが発生しました"));
    }
  };
