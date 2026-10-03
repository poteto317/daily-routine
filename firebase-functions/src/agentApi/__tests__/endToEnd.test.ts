/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { createAgentApiHandler } from "../handler";
import type { SyncDocData } from "../syncDoc";
import { applyChanges } from "../syncWriter";
import { createFakeFirestore } from "./fakeFirestore";

jest.mock("firebase-functions/logger", () => ({ error: jest.fn() }));

const KEY = `drk_${"A".repeat(43)}`;

describe("agentApi end-to-end（フェイク Firestore）", () => {
  it("支出作成で同期メタが進み、他フィールドと既存スナップショット順が保たれる", async () => {
    const fake = createFakeFirestore({
      "users/u1": {
        routines: [{ id: "r1" }],
        budgetCategories: [],
        budgetData: { expenses: {} },
        lastModified: 1000,
        deviceId: "device-a",
      },
    });
    const handler = createAgentApiHandler({
      resolveUid: async (key) => (key === KEY ? "u1" : null),
      readData: async (uid) =>
        (fake.get(`users/${uid}`) as SyncDocData) ?? null,
      runWrite: (uid, build) =>
        applyChanges(fake.db, uid, build, {
          now: () => 5000,
          serverTimestamp: () => "SERVER_TS",
        }),
      now: () => new Date("2026-10-03T00:00:00.000Z"),
    });

    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    await handler(
      {
        method: "POST",
        path: "/budget/expenses",
        headers: { authorization: `Bearer ${KEY}` },
        query: {},
        body: { date: "2026-10-03", amount: 800 },
      } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    const doc = fake.get("users/u1") as Record<string, unknown>;
    expect(doc.lastModified).toBe(5000);
    expect(doc.deviceId).toBe("api");
    expect(doc.routines).toEqual([{ id: "r1" }]);
    expect(
      (doc.budgetData as { expenses: Record<string, unknown[]> }).expenses[
        "2026-10"
      ],
    ).toHaveLength(1);
    expect(fake.snapshotsOf("u1")).toHaveLength(1);
  });
});

describe("agentApi end-to-end: 古い形式の同期データ（フィールド欠損）", () => {
  const setup = (doc: Record<string, unknown>) => {
    const fake = createFakeFirestore({ "users/u1": doc });
    const handler = createAgentApiHandler({
      resolveUid: async (key) => (key === KEY ? "u1" : null),
      readData: async (uid) =>
        (fake.get(`users/${uid}`) as SyncDocData) ?? null,
      runWrite: (uid, build) =>
        applyChanges(fake.db, uid, build, {
          now: () => 5000,
          serverTimestamp: () => "SERVER_TS",
        }),
      now: () => new Date("2026-10-03T00:00:00.000Z"),
    });
    const call = async (method: string, path: string, body: unknown = {}) => {
      const res = { status: jest.fn(), json: jest.fn() };
      res.status.mockReturnValue(res);
      await handler(
        {
          method,
          path,
          headers: { authorization: `Bearer ${KEY}` },
          query: {},
          body,
        } as unknown as Request,
        res as unknown as Response,
      );
      return res;
    };
    return { fake, call };
  };

  const oldDoc = {
    routines: [{ id: "r1" }],
    lastModified: 1000,
    deviceId: "device-a",
  };

  it("対象フィールドが無いドキュメントへの作成は 409 で、ドキュメントを変更しない", async () => {
    const { fake, call } = setup(oldDoc);
    const res = await call("POST", "/budget/income-items", {
      name: "給与",
      amount: 300000,
    });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "outdated_sync_data", message: expect.any(String) },
    });
    expect(fake.get("users/u1")).toEqual(oldDoc);
    expect(fake.snapshotsOf("u1")).toHaveLength(0);
  });

  it("budgetData が無いドキュメントへの支出作成も 409（予算設定ごと置き換えない）", async () => {
    const { fake, call } = setup({ ...oldDoc, budgetCategories: [] });
    const res = await call("POST", "/budget/expenses", {
      date: "2026-10-03",
      amount: 800,
    });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(fake.get("users/u1")).toEqual({ ...oldDoc, budgetCategories: [] });
  });

  it("budgetData はあるが expenses だけ無い場合は、他のキーを保って作成できる", async () => {
    const { fake, call } = setup({
      ...oldDoc,
      budgetData: { monthlyBudget: 100000 },
    });
    const res = await call("POST", "/budget/expenses", {
      date: "2026-10-03",
      amount: 800,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    const budgetData = (fake.get("users/u1") as Record<string, unknown>)
      .budgetData as Record<string, unknown>;
    expect(budgetData.monthlyBudget).toBe(100000);
    expect(budgetData.expenses).toBeDefined();
  });

  it("一覧は空として返し、更新・削除は従来どおり 404 になる", async () => {
    const { call } = setup(oldDoc);
    const list = await call("GET", "/budget/income-items");
    expect(list.status).toHaveBeenCalledWith(200);
    expect(list.json).toHaveBeenCalledWith({ incomeItems: [] });

    const update = await call("PATCH", "/budget/income-items/nope", {
      amount: 1,
    });
    expect(update.status).toHaveBeenCalledWith(404);
    const remove = await call("DELETE", "/budget/income-items/nope");
    expect(remove.status).toHaveBeenCalledWith(404);
  });
});
