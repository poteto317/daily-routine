/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { ApiError } from "../errors";
import { createAgentApiHandler, type HandlerDeps } from "../handler";

jest.mock("firebase-functions/logger", () => ({ error: jest.fn() }));

const NOW = new Date("2026-10-03T00:00:00.000Z");
const KEY = `drk_${"A".repeat(43)}`;

const makeRes = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<{
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
}> = {}): Request =>
  ({
    method: "GET",
    path: "/budget/categories",
    headers: { authorization: `Bearer ${KEY}` },
    query: {},
    body: {},
    ...overrides,
  }) as unknown as Request;

const makeDeps = (overrides: Partial<HandlerDeps> = {}): HandlerDeps => ({
  resolveUid: jest.fn().mockResolvedValue("u1"),
  readData: jest.fn().mockResolvedValue({ budgetCategories: [{ id: "c1" }] }),
  runWrite: jest.fn(async (_uid, build) =>
    build({ budgetCategories: [] }),
  ),
  now: () => NOW,
  ...overrides,
});

const run = async (deps: HandlerDeps, req: Request) => {
  const res = makeRes();
  await createAgentApiHandler(deps)(req, res as unknown as Response);
  return res;
};

describe("createAgentApiHandler", () => {
  it("Authorization が無ければ 401", async () => {
    const deps = makeDeps();
    const res = await run(deps, makeReq({ headers: {} }));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "unauthorized", message: expect.any(String) },
    });
    expect(deps.resolveUid).not.toHaveBeenCalled();
  });

  it("キーが未登録なら 401", async () => {
    const res = await run(
      makeDeps({ resolveUid: jest.fn().mockResolvedValue(null) }),
      makeReq(),
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("GET は readData の結果を返し、書き込みはしない", async () => {
    const deps = makeDeps();
    const res = await run(deps, makeReq());
    expect(deps.readData).toHaveBeenCalledWith("u1");
    expect(deps.runWrite).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ categories: [{ id: "c1" }] });
  });

  it("GET で同期データが無ければ 404 no_sync_data", async () => {
    const res = await run(
      makeDeps({ readData: jest.fn().mockResolvedValue(null) }),
      makeReq(),
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "no_sync_data", message: expect.any(String) },
    });
  });

  it("POST は runWrite 経由で 201 を返す", async () => {
    const deps = makeDeps();
    const res = await run(
      deps,
      makeReq({ method: "POST", body: { name: "食費" } }),
    );
    expect(deps.runWrite).toHaveBeenCalledWith("u1", expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      category: expect.objectContaining({ name: "食費" }),
    });
  });

  it("query の配列値は無視（undefined 扱い）し、文字列のみ渡す", async () => {
    const res = await run(
      makeDeps(),
      makeReq({ path: "/budget/expenses", query: { month: ["2026-10", "2026-11"] } }),
    );
    // month が配列 → undefined 扱いで全月取得（400 にならない）
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("ルート不一致 404 / メソッド不一致 405 / 検証エラー 400 をエラー形式で返す", async () => {
    const notFoundRes = await run(makeDeps(), makeReq({ path: "/nope" }));
    expect(notFoundRes.status).toHaveBeenCalledWith(404);

    const methodRes = await run(makeDeps(), makeReq({ method: "PUT" }));
    expect(methodRes.status).toHaveBeenCalledWith(405);

    const invalidRes = await run(
      makeDeps(),
      makeReq({ method: "POST", body: { name: "" } }),
    );
    expect(invalidRes.status).toHaveBeenCalledWith(400);
  });

  it("runWrite が ApiError を投げたらその status を返す", async () => {
    const res = await run(
      makeDeps({
        runWrite: jest.fn().mockRejectedValue(new ApiError(404, "no_sync_data", "なし")),
      }),
      makeReq({ method: "POST", body: { name: "a" } }),
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("想定外エラーは 500 で詳細を返さない", async () => {
    const res = await run(
      makeDeps({ resolveUid: jest.fn().mockRejectedValue(new Error("secret detail")) }),
      makeReq(),
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain("secret detail");
  });
});
