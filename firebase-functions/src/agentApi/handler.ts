import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { authenticate } from "./authenticate";
import { respondWithError } from "./errorResponse";
import { executeOperation } from "./executeOperation";
import type { HandlerDeps } from "./handlerDeps";
import { toStringQuery } from "./requestQuery";
import { matchRoute } from "./router";

/** 認証 → ルーティング → 操作の実行 → 応答、の流れをつなぐ */
export const createAgentApiHandler =
  (deps: HandlerDeps) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await authenticate(
        req.headers.authorization,
        deps.resolveUid,
      );
      const route = matchRoute(req.method, req.path);
      const outcome = await executeOperation(deps, uid, route, {
        id: route.id,
        query: toStringQuery(req.query),
        body: req.body,
        now: deps.now(),
      });
      res.status(outcome.status).json(outcome.body);
    } catch (error) {
      respondWithError(res, error);
    }
  };
