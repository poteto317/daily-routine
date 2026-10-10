/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import type { Response } from "express";
import { createAgentApiHandler } from "../handler";
import type { SyncDocData } from "../syncDoc";
import { applyChanges } from "../syncWriter";
import { createFakeFirestore } from "./fakeFirestore";
import { strength } from "./workoutFixtures";

jest.mock("firebase-functions/logger", () => ({ error: jest.fn() }));
const setup = (
  data: SyncDocData | null = { workoutExercises: [], workoutRecordHistory: {} },
) => {
  const fake = createFakeFirestore({
    ...(data ? { "users/u1": data } : {}),
    "users/u2": { untouched: true },
  });
  const handler = createAgentApiHandler({
    resolveUid: async (key) => (key === "test-key" ? "u1" : null),
    readData: async (uid) => (fake.get(`users/${uid}`) as SyncDocData) ?? null,
    runWrite: (uid, build) =>
      applyChanges(fake.db, uid, build, {
        now: () => 5000,
        serverTimestamp: () => "SERVER_TS",
      }),
    now: () => new Date("2026-10-08T00:00:00.000Z"),
  });
  const call = async (
    method: string,
    path: string,
    body: unknown = {},
    query: Record<string, unknown> = {},
    authorization = "Bearer test-key",
  ) => {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    await handler(
      {
        method,
        path,
        body,
        query,
        headers: { authorization },
      } as unknown as Request,
      res as unknown as Response,
    );
    return {
      status: res.status.mock.calls[0][0] as number,
      body: res.json.mock.calls[0][0],
    };
  };
  return { fake, call };
};
it("8操作とスナップショット、アカウント分離を通して検証する", async () => {
  const { fake, call } = setup();
  const created = await call("POST", "/workout/exercises", {
    name: "ベンチ",
    label: "strength",
  });
  expect(created.status).toBe(201);
  const exerciseId = created.body.exercise.id;
  expect((await call("GET", "/workout/exercises")).body.exercises).toHaveLength(
    1,
  );
  const record = await call("POST", "/workout/records", {
    date: "2026-10-08",
    exerciseId,
    weightKg: 50,
    reps: 10,
  });
  expect(record.status).toBe(201);
  const recordId = record.body.record.id;
  expect(
    (
      await call("PATCH", `/workout/exercises/${exerciseId}`, {
        name: "プレス",
      })
    ).status,
  ).toBe(200);
  expect(
    (await call("DELETE", `/workout/exercises/${exerciseId}`)).status,
  ).toBe(200);
  const updated = await call("PATCH", `/workout/records/${recordId}`, {
    reps: 12,
  });
  expect(updated.body.record).toMatchObject({
    exerciseName: "ベンチ",
    reps: 12,
  });
  expect(
    (await call("GET", "/workout/records", {}, { exerciseId })).body.records,
  ).toHaveLength(1);
  expect(fake.get("users/u1")).toMatchObject({
    deviceId: "api",
    lastModified: expect.any(Number),
  });
  expect(fake.snapshotsOf("u1")).toHaveLength(1);
  expect(fake.get("users/u2")).toEqual({ untouched: true });
  expect((await call("DELETE", `/workout/records/${recordId}`)).body).toEqual({
    deleted: recordId,
  });
  expect((await call("GET", "/workout/records")).body).toEqual({ records: [] });
});
it("認証・未知メソッド・未知/重複クエリを共通基盤で拒否する", async () => {
  const { call } = setup();
  expect((await call("GET", "/workout/records", {}, {}, "")).status).toBe(401);
  expect((await call("PUT", "/workout/records")).status).toBe(405);
  for (const query of [
    { bad: "x" },
    { label: ["strength", "running"] },
    { label: { nested: "strength" } },
  ])
    expect(
      (await call("GET", "/workout/records", {}, query)).body.error.code,
    ).toBe("invalid_query");
  expect((await call("POST", "/workout/exercises", null)).body.error.code).toBe(
    "invalid_body",
  );
});
it("同期データ欠損と古い同期フィールドの保護を維持する", async () => {
  expect(
    (await setup(null).call("GET", "/workout/exercises")).body.error.code,
  ).toBe("no_sync_data");
  const { call } = setup({ workoutExercises: [strength] });
  expect((await call("GET", "/workout/records")).body).toEqual({ records: [] });
  expect(
    (
      await call("POST", "/workout/records", {
        date: "2026-10-08",
        exerciseId: "s",
        weightKg: 50,
        reps: 10,
      })
    ).body.error.code,
  ).toBe("outdated_sync_data");
  expect(
    (
      await setup({}).call("POST", "/workout/exercises", {
        name: "ベンチ",
        label: "strength",
      })
    ).body.error.code,
  ).toBe("outdated_sync_data");
  expect(
    (
      await setup({}).call("POST", "/workout/records", {
        date: "2026-10-08",
        exerciseId: "gone",
        weightKg: 50,
        reps: 10,
      })
    ).body.error.code,
  ).toBe("invalid_field");
});
