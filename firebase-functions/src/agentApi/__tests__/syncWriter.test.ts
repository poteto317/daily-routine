/** @jest-environment node */
import { ApiError } from "../errors";
import { API_DEVICE_ID, MAX_SYNC_SNAPSHOTS } from "../syncConstants";
import type { OperationOutcome } from "../operations/types";
import { applyChanges } from "../syncWriter";
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
    const fake = createFakeFirestore({
      "users/u1": { ...baseDoc, lastModified: 9000 },
    });
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
      deps(100),
    );
    expect(
      (fake.get("users/u1") as { lastModified: number }).lastModified,
    ).toBe(9001);
  });

  it("変更後の状態をスナップショットとして保存する（メタ情報は除く）", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    await applyChanges(
      fake.db,
      "u1",
      () => ({
        status: 200,
        body: {},
        changes: { budgetCategories: [{ id: "c1" }] },
      }),
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
    const initial: Record<string, Record<string, unknown>> = {
      "users/u1": baseDoc,
    };
    for (let index = 1; index <= MAX_SYNC_SNAPSHOTS; index += 1) {
      initial[`users/u1/syncSnapshots/s${index}`] = {
        uploadedAt: index,
        data: {},
      };
    }
    const fake = createFakeFirestore(initial);
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
      deps(5000),
    );

    const uploadedAts = fake
      .snapshotsOf("u1")
      .map((s) => (s as { uploadedAt: number }).uploadedAt);
    expect(uploadedAts).toEqual([5000, 5, 4, 3, 2]);
  });

  it("最新スナップショットが API 由来なら新規作成せず同じドキュメントを上書きする", async () => {
    const fake = createFakeFirestore({
      "users/u1": baseDoc,
      "users/u1/syncSnapshots/app1": {
        id: "app1",
        uploadedAt: 100,
        deviceId: "device-a",
        data: {},
      },
      "users/u1/syncSnapshots/api1": {
        id: "api1",
        uploadedAt: 900,
        deviceId: API_DEVICE_ID,
        data: { old: true },
      },
    });
    await applyChanges(
      fake.db,
      "u1",
      () => ({
        status: 200,
        body: {},
        changes: { budgetCategories: [{ id: "c1" }] },
      }),
      deps(5000),
    );

    expect(fake.snapshotsOf("u1")).toHaveLength(2);
    expect(fake.get("users/u1/syncSnapshots/app1")).toEqual({
      id: "app1",
      uploadedAt: 100,
      deviceId: "device-a",
      data: {},
    });
    expect(fake.get("users/u1/syncSnapshots/api1")).toEqual({
      id: "api1",
      uploadedAt: 5000,
      deviceId: API_DEVICE_ID,
      data: { routines: [{ id: "r1" }], budgetCategories: [{ id: "c1" }] },
      updatedAt: "SERVER_TS",
    });
  });

  it("API 由来の最新スナップショットを上書きする場合は上限でも古いものを削除しない", async () => {
    const initial: Record<string, Record<string, unknown>> = {
      "users/u1": baseDoc,
    };
    for (let index = 1; index < MAX_SYNC_SNAPSHOTS; index += 1) {
      initial[`users/u1/syncSnapshots/s${index}`] = {
        uploadedAt: index,
        deviceId: "device-a",
        data: {},
      };
    }
    initial["users/u1/syncSnapshots/api1"] = {
      id: "api1",
      uploadedAt: 900,
      deviceId: API_DEVICE_ID,
      data: {},
    };
    const fake = createFakeFirestore(initial);
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
      deps(5000),
    );
    const uploadedAts = fake
      .snapshotsOf("u1")
      .map((s) => (s as { uploadedAt: number }).uploadedAt);
    expect(uploadedAts).toEqual([5000, 4, 3, 2, 1]);
  });

  it("最新スナップショットがアプリ端末由来なら新規作成する", async () => {
    const fake = createFakeFirestore({
      "users/u1": baseDoc,
      "users/u1/syncSnapshots/app1": {
        id: "app1",
        uploadedAt: 100,
        deviceId: "device-a",
        data: {},
      },
    });
    await applyChanges(
      fake.db,
      "u1",
      () => ({ status: 200, body: {}, changes: { budgetCategories: [] } }),
      deps(5000),
    );
    const snapshots = fake.snapshotsOf("u1") as {
      uploadedAt: number;
      deviceId: string;
    }[];
    expect(snapshots.map((s) => s.uploadedAt)).toEqual([5000, 100]);
    expect(snapshots[0].deviceId).toBe(API_DEVICE_ID);
  });

  it("changes が無ければ何も書き込まない", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    const outcome = await applyChanges<OperationOutcome>(
      fake.db,
      "u1",
      () => ({ status: 200, body: { x: 1 } }),
      deps(5000),
    );
    expect(outcome.body).toEqual({ x: 1 });
    expect(fake.get("users/u1")).toEqual(baseDoc);
    expect(fake.snapshotsOf("u1")).toHaveLength(0);
  });

  it("変更対象のフィールドが同期ドキュメントに無ければ 409 outdated_sync_data で、何も書き込まない", async () => {
    const { budgetCategories, ...withoutCategories } = baseDoc;
    void budgetCategories;
    const fake = createFakeFirestore({ "users/u1": withoutCategories });
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => ({
          status: 201,
          body: {},
          changes: { budgetCategories: [{ id: "c1" }] },
        }),
        deps(5000),
      ),
    ).rejects.toMatchObject({ status: 409, code: "outdated_sync_data" });
    expect(fake.get("users/u1")).toEqual(withoutCategories);
    expect(fake.snapshotsOf("u1")).toHaveLength(0);
  });

  it("値が null のフィールドも欠損として扱う（アプリの正規化と同じ）", async () => {
    const fake = createFakeFirestore({
      "users/u1": { ...baseDoc, budgetCategories: null },
    });
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => ({
          status: 200,
          body: {},
          changes: { budgetCategories: [] },
        }),
        deps(5000),
      ),
    ).rejects.toMatchObject({ code: "outdated_sync_data" });
  });

  it("複数フィールドを書く操作は、1 つでも欠けていれば中断する", async () => {
    const fake = createFakeFirestore({ "users/u1": baseDoc });
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => ({
          status: 200,
          body: {},
          changes: { budgetCategories: [], journalHistory: {} },
        }),
        deps(5000),
      ),
    ).rejects.toMatchObject({ code: "outdated_sync_data" });
    expect(fake.get("users/u1")).toEqual(baseDoc);
  });

  it("空配列で存在するフィールドには書き込める（欠損と空を区別する）", async () => {
    const fake = createFakeFirestore({
      "users/u1": { ...baseDoc, budgetCategories: [] },
    });
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => ({
          status: 201,
          body: {},
          changes: { budgetCategories: [{ id: "c1" }] },
        }),
        deps(5000),
      ),
    ).resolves.toMatchObject({ status: 201 });
  });

  it("変更が無い操作（一覧など）は、フィールドが欠けていても通る", async () => {
    const fake = createFakeFirestore({ "users/u1": { lastModified: 1000 } });
    const outcome = await applyChanges<OperationOutcome>(
      fake.db,
      "u1",
      () => ({ status: 200, body: {} }),
      deps(5000),
    );
    expect(outcome.status).toBe(200);
  });

  it("操作側の検証エラー（400 など）は、欠損の判定より先に返る", async () => {
    const { budgetCategories, ...withoutCategories } = baseDoc;
    void budgetCategories;
    const fake = createFakeFirestore({ "users/u1": withoutCategories });
    await expect(
      applyChanges(
        fake.db,
        "u1",
        () => {
          throw new ApiError(400, "invalid_field", "x");
        },
        deps(5000),
      ),
    ).rejects.toMatchObject({ status: 400 });
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
