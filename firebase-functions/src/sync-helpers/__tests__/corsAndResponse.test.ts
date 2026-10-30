/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { applyCorsHeaders, handlePreflightRequest } from "../cors";
import {
  sendInternalServerError,
  sendInvalidSyncRequest,
  sendMethodNotAllowed,
  sendSyncSuccess,
} from "../response";

const makeRes = () => {
  const res = { set: jest.fn(), status: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

const asResponse = (res: ReturnType<typeof makeRes>) =>
  res as unknown as Response;

describe("applyCorsHeaders", () => {
  it("全オリジンからの POST と Content-Type ヘッダーを許可する", () => {
    const res = makeRes();
    applyCorsHeaders(asResponse(res));
    expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
    expect(res.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "POST",
    );
    expect(res.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type",
    );
  });
});

describe("handlePreflightRequest", () => {
  it("OPTIONS なら 204 を返して true", () => {
    const res = makeRes();
    const handled = handlePreflightRequest(
      { method: "OPTIONS" } as Request,
      asResponse(res),
    );
    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith("");
  });

  it("OPTIONS 以外は何も返さず false", () => {
    const res = makeRes();
    const handled = handlePreflightRequest(
      { method: "POST" } as Request,
      asResponse(res),
    );
    expect(handled).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});

describe("同期 API のレスポンス", () => {
  it.each([
    ["sendMethodNotAllowed", sendMethodNotAllowed, 405, "Method Not Allowed"],
    [
      "sendInvalidSyncRequest",
      sendInvalidSyncRequest,
      400,
      "Missing token or routines",
    ],
    [
      "sendInternalServerError",
      sendInternalServerError,
      500,
      "Internal server error",
    ],
  ] as const)("%s は %i とエラー本文を返す", (_name, send, status, error) => {
    const res = makeRes();
    send(asResponse(res));
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.send).toHaveBeenCalledWith({ error });
  });

  it("成功時は 200 と同期したルーティン件数を返す", () => {
    const res = makeRes();
    sendSyncSuccess(asResponse(res), 3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true, routinesCount: 3 });
  });
});
