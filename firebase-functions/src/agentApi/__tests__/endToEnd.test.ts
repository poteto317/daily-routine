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
