/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import {
  isPostMethod,
  isValidSyncRequest,
  parseSyncRequestBody,
} from "../request";
import type { SyncRequestBody } from "../types";

const makeReq = (body: unknown): Request => ({ body }) as unknown as Request;

/** 型上はあり得ないが実行時に届きうるボディを検証用に作る */
const unsafeBody = (body: Record<string, unknown>): SyncRequestBody =>
  body as unknown as SyncRequestBody;

describe("parseSyncRequestBody", () => {
  it("リクエストボディをそのまま返す", () => {
    const body = { token: "t", routines: [] };
    expect(parseSyncRequestBody(makeReq(body))).toBe(body);
  });

  it.each([undefined, null])("ボディが %s なら空オブジェクトを返す", (body) => {
    expect(parseSyncRequestBody(makeReq(body))).toEqual({});
  });
});

describe("isPostMethod", () => {
  it("POST のみ true", () => {
    expect(isPostMethod("POST")).toBe(true);
  });

  it.each(["GET", "PUT", "DELETE", "OPTIONS", "post"])(
    "%s は false（大文字小文字も区別する）",
    (method) => {
      expect(isPostMethod(method)).toBe(false);
    },
  );
});

describe("isValidSyncRequest", () => {
  it("token が空でない文字列で routines が配列なら true", () => {
    expect(isValidSyncRequest({ token: "abc", routines: [] })).toBe(true);
    expect(isValidSyncRequest({ token: "abc", routines: [{ id: "r1" }] })).toBe(
      true,
    );
  });

  it("token が空文字なら false", () => {
    expect(isValidSyncRequest({ token: "", routines: [] })).toBe(false);
  });

  it("token が無ければ false", () => {
    expect(isValidSyncRequest({ routines: [] })).toBe(false);
  });

  it("token が文字列でなければ false", () => {
    expect(isValidSyncRequest(unsafeBody({ token: 123, routines: [] }))).toBe(
      false,
    );
  });

  it("routines が無ければ false", () => {
    expect(isValidSyncRequest({ token: "abc" })).toBe(false);
  });

  it("routines が配列でなければ false", () => {
    expect(isValidSyncRequest(unsafeBody({ token: "abc", routines: {} }))).toBe(
      false,
    );
  });
});
