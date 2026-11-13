/** @jest-environment node */
import type {
  CollectionReference,
  QueryDocumentSnapshot,
  Transaction,
} from "../../adminSdk";
import { saveApiSnapshot, toSnapshotPayload } from "../snapshotWriter";
import { API_DEVICE_ID, MAX_SYNC_SNAPSHOTS } from "../syncConstants";

type FakeSnapshotDoc = {
  id: string;
  ref: { path: string };
  data: () => Record<string, unknown>;
};

const snapshotDoc = (
  id: string,
  deviceId: string | undefined,
): FakeSnapshotDoc => ({
  id,
  ref: { path: `users/u1/syncSnapshots/${id}` },
  data: () => (deviceId === undefined ? {} : { deviceId }),
});

const setup = (existing: FakeSnapshotDoc[]) => {
  const transaction = { set: jest.fn(), delete: jest.fn() };
  const newRef = { id: "new-id", path: "users/u1/syncSnapshots/new-id" };
  const snapshotsRef = { doc: jest.fn(() => newRef) };
  const save = (data: Record<string, unknown> = { budgetCategories: [] }) =>
    saveApiSnapshot({
      transaction: transaction as unknown as Transaction,
      snapshotsRef: snapshotsRef as unknown as CollectionReference,
      existing: existing as unknown as QueryDocumentSnapshot[],
      data,
      lastModified: 5000,
      serverTimestamp: "SERVER_TS",
    });
  return { transaction, snapshotsRef, newRef, save };
};

describe("toSnapshotPayload", () => {
  it("同期メタ情報（lastModified / deviceId / updatedAt）だけを除く", () => {
    expect(
      toSnapshotPayload({
        routines: [1],
        lastModified: 1,
        deviceId: "d",
        updatedAt: "t",
      }),
    ).toEqual({ routines: [1] });
  });

  it("元のオブジェクトを変更しない", () => {
    const source = { routines: [1], lastModified: 1 };
    toSnapshotPayload(source);
    expect(source).toEqual({ routines: [1], lastModified: 1 });
  });
});

describe("saveApiSnapshot", () => {
  it("既存が無ければ新規作成する（削除なし）", () => {
    const { transaction, newRef, save } = setup([]);
    save({ budgetCategories: [], lastModified: 1 });

    expect(transaction.delete).not.toHaveBeenCalled();
    expect(transaction.set).toHaveBeenCalledWith(newRef, {
      id: "new-id",
      uploadedAt: 5000,
      deviceId: API_DEVICE_ID,
      data: { budgetCategories: [] },
      updatedAt: "SERVER_TS",
    });
  });

  it("最新がアプリ由来なら新規作成し、上限を超える古いものを削除する", () => {
    const existing = Array.from({ length: MAX_SYNC_SNAPSHOTS }, (_, index) =>
      snapshotDoc(`s${index}`, "device-a"),
    );
    const { transaction, newRef, save } = setup(existing);
    save();

    expect(transaction.delete).toHaveBeenCalledTimes(1);
    expect(transaction.delete).toHaveBeenCalledWith(existing[4].ref);
    expect(transaction.set).toHaveBeenCalledTimes(1);
    expect(transaction.set.mock.calls[0][0]).toBe(newRef);
  });

  it("最新に deviceId が無い場合もアプリ由来と同じく新規作成する", () => {
    const { transaction, newRef, save } = setup([snapshotDoc("s0", undefined)]);
    save();
    expect(transaction.set.mock.calls[0][0]).toBe(newRef);
  });

  it("最新が API 由来なら新規作成も削除もせず、同じドキュメントを上書きする", () => {
    const latest = snapshotDoc("api-latest", API_DEVICE_ID);
    const existing = [
      latest,
      snapshotDoc("s1", "device-a"),
      snapshotDoc("s2", "device-a"),
    ];
    const { transaction, snapshotsRef, save } = setup(existing);
    save({ budgetCategories: [{ id: "c1" }] });

    expect(snapshotsRef.doc).not.toHaveBeenCalled();
    expect(transaction.delete).not.toHaveBeenCalled();
    expect(transaction.set).toHaveBeenCalledTimes(1);
    expect(transaction.set).toHaveBeenCalledWith(latest.ref, {
      id: "api-latest",
      uploadedAt: 5000,
      deviceId: API_DEVICE_ID,
      data: { budgetCategories: [{ id: "c1" }] },
      updatedAt: "SERVER_TS",
    });
  });

  it("API 由来が最新でなければ（2 番目以降が API でも）上書きしない", () => {
    const existing = [
      snapshotDoc("s0", "device-a"),
      snapshotDoc("s1", API_DEVICE_ID),
    ];
    const { transaction, newRef, save } = setup(existing);
    save();
    expect(transaction.set.mock.calls[0][0]).toBe(newRef);
  });
});
