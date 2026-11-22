/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { getAuth } from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";
import type { Firestore } from "../../adminSdk";
import { handleSyncRoutinesRequest } from "../handler";
import { saveNotificationSubscription } from "../storage";

jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));
jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../storage", () => ({ saveNotificationSubscription: jest.fn() }));

const verifyIdToken = jest.fn();
const save = jest.mocked(saveNotificationSubscription);
const db = {} as Firestore;
const token = "device-registration";
const routine = {
  id: "r1",
  title: "Routine",
  startTime: "09:00",
  daysOfWeek: [1],
};
const payload = {
  token,
  routines: [{ ...routine, description: "local-only" }],
};

const run = async (
  overrides: Partial<{
    method: string;
    body: unknown;
    headers: Record<string, string>;
  }> = {},
) => {
  const req = {
    method: "POST",
    headers: { authorization: "Bearer test-id-token" },
    body: payload,
    ...overrides,
  } as Request;
  const res = { set: jest.fn(), status: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  await handleSyncRoutinesRequest(req, res as unknown as Response, db);
  return res;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getAuth).mockReturnValue({ verifyIdToken } as never);
  verifyIdToken.mockResolvedValue({ uid: "verified-user" });
  save.mockResolvedValue(true);
});

it("検証した UID と通知用項目だけを保存に渡す", async () => {
  const res = await run();

  expect(verifyIdToken).toHaveBeenCalledWith("test-id-token");
  expect(save).toHaveBeenCalledWith(db, "verified-user", token, [routine]);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith({ success: true, routinesCount: 1 });
  expect(JSON.stringify(jest.mocked(logger.info).mock.calls)).not.toContain(
    token,
  );
});

it.each([{}, { authorization: "Basic unused" }, { authorization: "Bearer " }])(
  "認証ヘッダーが無効な場合は保存しない",
  async (headers) => {
    const res = await run({ headers: headers as Record<string, string> });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(verifyIdToken).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  },
);

it("ID トークンを検証できなければ保存しない", async () => {
  verifyIdToken.mockRejectedValue(new Error("token rejected"));
  const res = await run();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(save).not.toHaveBeenCalled();
});

it("別の所有者の登録を拒否する", async () => {
  save.mockResolvedValue(false);
  const res = await run();
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.send).toHaveBeenCalledWith({
    error: "Forbidden",
    code: "subscription-owner-mismatch",
  });
});

it("本文で所有者を指定したリクエストは拒否する", async () => {
  const res = await run({ body: { ...payload, uid: "unverified-user" } });
  expect(res.status).toHaveBeenCalledWith(400);
  expect(save).not.toHaveBeenCalled();
});

it("認証なしの OPTIONS で Authorization を許可する", async () => {
  const res = await run({ method: "OPTIONS", headers: {} });
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.set).toHaveBeenCalledWith(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  expect(verifyIdToken).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});

it("POST 以外は認証せずに 405 を返す", async () => {
  const res = await run({ method: "GET", headers: {} });
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
  expect(verifyIdToken).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});

it.each([
  undefined,
  null,
  { token: "", routines: [] },
  { token, routines: "invalid" },
])("不正な本文を保存しない", async (body) => {
  const res = await run({ body });
  expect(res.status).toHaveBeenCalledWith(400);
  expect(save).not.toHaveBeenCalled();
});

it("空配列を本人の登録に保存する", async () => {
  const res = await run({ body: { token, routines: [] } });
  expect(save).toHaveBeenCalledWith(db, "verified-user", token, []);
  expect(res.send).toHaveBeenCalledWith({ success: true, routinesCount: 0 });
});

it("保存エラーを一般化して返し、エラーの内部情報を出さない", async () => {
  save.mockRejectedValue(new Error("private internal data"));
  const res = await run();
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ error: "Internal server error" });
  expect(JSON.stringify(jest.mocked(logger.error).mock.calls)).not.toContain(
    "private internal data",
  );
});
