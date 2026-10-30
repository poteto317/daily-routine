/** @jest-environment node */
jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../storage", () => ({
  saveUserData: jest.fn().mockResolvedValue(undefined),
}));

import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import type * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { handleSyncRoutinesRequest } from "../handler";
import { saveUserData } from "../storage";

const mockedSaveUserData = jest.mocked(saveUserData);
const db = {} as admin.firestore.Firestore;
const TOKEN = "fcm-token-0123456789-abcdef";

const makeRes = () => {
  const res = { set: jest.fn(), status: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<{ method: string; body: unknown }> = {}) =>
  ({
    method: "POST",
    body: { token: TOKEN, routines: [{ id: "r1" }, { id: "r2" }] },
    ...overrides,
  }) as unknown as Request;

const run = async (req: Request) => {
  const res = makeRes();
  await handleSyncRoutinesRequest(req, res as unknown as Response, db);
  return res;
};

describe("handleSyncRoutinesRequest", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("正しいリクエストならユーザーデータを保存し、件数を返す", async () => {
    const res = await run(makeReq());

    expect(mockedSaveUserData).toHaveBeenCalledWith(db, TOKEN, [
      { id: "r1" },
      { id: "r2" },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true, routinesCount: 2 });
  });

  it("ログにはトークンの先頭 20 文字だけを出す", async () => {
    await run(makeReq());

    const message = String(jest.mocked(logger.info).mock.calls[0][0]);
    expect(message).toContain(TOKEN.substring(0, 20));
    expect(message).not.toContain(TOKEN);
  });

  it("405 を返す場合も CORS ヘッダーを付ける", async () => {
    const res = await run(makeReq({ method: "GET" }));
    expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
  });

  it("OPTIONS は 204 を返し、保存しない", async () => {
    const res = await run(makeReq({ method: "OPTIONS" }));

    expect(res.status).toHaveBeenCalledWith(204);
    expect(mockedSaveUserData).not.toHaveBeenCalled();
  });

  it("POST 以外は 405 を返し、保存しない", async () => {
    const res = await run(makeReq({ method: "GET" }));

    expect(res.status).toHaveBeenCalledWith(405);
    expect(mockedSaveUserData).not.toHaveBeenCalled();
  });

  it.each([
    ["ボディが無い", undefined],
    ["token が空文字", { token: "", routines: [] }],
    ["routines が配列でない", { token: TOKEN, routines: "x" }],
  ])("%s なら 400 を返し、保存しない", async (_label, body) => {
    const res = await run(makeReq({ body }));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Missing token or routines",
    });
    expect(mockedSaveUserData).not.toHaveBeenCalled();
  });

  it("routines が空配列でも保存し、件数 0 を返す", async () => {
    const res = await run(makeReq({ body: { token: TOKEN, routines: [] } }));

    expect(mockedSaveUserData).toHaveBeenCalledWith(db, TOKEN, []);
    expect(res.send).toHaveBeenCalledWith({ success: true, routinesCount: 0 });
  });

  it("保存に失敗したら 500 を返し、エラーをログに残す", async () => {
    const error = new Error("firestore down");
    mockedSaveUserData.mockRejectedValueOnce(error);

    const res = await run(makeReq());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Internal server error" });
    expect(logger.error).toHaveBeenCalledWith("Sync error:", error);
  });
});
