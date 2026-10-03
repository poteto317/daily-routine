/** @jest-environment node */
import {
  API_DEVICE_ID,
  MAX_SYNC_SNAPSHOTS,
  applyChanges,
  readLastModified,
} from "../syncWriter";
import { createFakeFirestore } from "./fakeFirestore";

const deps = (now: number) => ({
  now: () => now,
  serverTimestamp: () => "SERVER_TS",
});

const baseDoc = {
  routines: [{ id: "r1" }],
  budgetCategories: [],
  lastModified: 1000,
  deviceId: "device-a",
  updatedAt: "OLD_TS",
};

describe("readLastModified", () => {
  it("number / Timestamp風 / その他", () => {
    expect(readLastModified(123)).toBe(123);
    expect(readLastModified({ toMillis: () => 456 })).toBe(456);
    expect(readLastModified(undefined)).toBe(0);
    expect(readLastModified("x")).toBe(0);
  });
});

describe("applyChanges", () => {
  it("changes と同期メタ情報だけを書き、他フィールドは変更しない", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    const outcome = await applyChanges(
      fake.db,
      "u1",
      () => ({
        status: 201,
        body: { ok: true },
        changes: { budgetCategories: [{ id: "c1" }] },
      }),
      deps(5000),
    );

    expect(outcome.status).toBe(201);
    expect(fake.get("users/u1")).toEqual({
      ...baseDoc,
      budgetCategories: [{ id: "c1" }],
      lastModified: 5000,
      deviceId: API_DEVICE_ID,
      updatedAt: "SERVER_TS",
    });
  });

  it("時計が巻き戻っていても lastModified は既存値 + 1 以上にする", async () => {
    const fake = createFakeFirestore({ "users/u1": { ...baseDoc, lastModified: 9000 } });
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
      deps(100),
    );
    expect((fake.get("users/u1") as { lastModified: number }).lastModified).toBe(9001);
  });

  it("変更後の状態をスナップショットとして保存する（メタ情報は除く）", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [{ id: "c1" }] } }),
      deps(5000),
    );

    const snapshots = fake.snapshotsOf("u1");
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      uploadedAt: 5000,
      deviceId: API_DEVICE_ID,
      updatedAt: "SERVER_TS",
      data: { routines: [{ id: "r1" }], budgetCategories: [{ id: "c1" }] },
    });
    const data = (snapshots[0] as { data: Record<string, unknown> }).data;
    expect("lastModified" in data).toBe(false);
    expect("deviceId" in data).toBe(false);
    expect("updatedAt" in data).toBe(false);
  });

  it("スナップショットは最大件数に収め、古いものから削除する", async () => {
    const initial: Record<string, Record<string, unknown>> = { "users/u1": baseDoc };
    for (let index = 1; index <= MAX_SYNC_SNAPSHOTS; index += 1) {
      initial[`users/u1/syncSnapshots/s${index}`] = { uploadedAt: index, data: {} };
    }
    const fake = createFakeFirestore(initial);
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
      deps(5000),
    );

    const uploadedAts = fake.snapshotsOf("u1").map((s) => (s as { uploadedAt: number }).uploadedAt);
    expect(uploadedAts).toEqual([5000, 5, 4, 3, 2]);
  });

  it("changes が無ければ何も書き込まない", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    const outcome = await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: { x: 1 } }),
      deps(5000),
    );
    expect(outcome.body).toEqual({ x: 1 });
    expect(fake.get("users/u1")).toEqual(baseDoc);
    expect(fake.snapshotsOf("u1")).toHaveLength(0);
  });

  it("users/{uid} が無ければ 404 no_sync_data で何も作らない", async () => {
    const fake = createFakeFirestore({});
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
        deps(5000),
      ),
    ).rejects.toMatchObject({ status: 404, code: "no_sync_data" });
    expect(fake.get("users/u1")).toBeUndefined();
  });

  it("build が投げたエラーはそのまま伝播し、書き込まない", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => {
          throw new Error("boom");
        },
        deps(5000),
      ),
    ).rejects.toThrow("boom");
    expect(fake.get("users/u1")).toEqual(baseDoc);
  });
});
