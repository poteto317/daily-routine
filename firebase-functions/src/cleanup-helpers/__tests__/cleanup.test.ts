/** @jest-environment node */
import type * as admin from "firebase-admin";
import { getCleanupThresholdDate } from "../date";
import { deleteOldNotifications } from "../executor";

describe("getCleanupThresholdDate", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("現在時刻のちょうど 1 日前を返す", () => {
    jest.useFakeTimers({ now: new Date("2026-10-30T00:00:00+09:00") });

    expect(getCleanupThresholdDate()).toEqual(
      new Date("2026-10-29T00:00:00+09:00"),
    );
  });

  it("月初なら前月末日になる", () => {
    jest.useFakeTimers({ now: new Date("2026-03-01T00:00:00+09:00") });

    expect(getCleanupThresholdDate()).toEqual(
      new Date("2026-02-28T00:00:00+09:00"),
    );
  });
});

describe("deleteOldNotifications", () => {
  const makeDb = (refs: string[]) => {
    const where = jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        docs: refs.map((ref) => ({ ref })),
        size: refs.length,
      }),
    }));
    const collection = jest.fn(() => ({ where }));
    const batch = { delete: jest.fn(), commit: jest.fn() };
    batch.commit.mockResolvedValue(undefined);
    return {
      db: {
        collection,
        batch: () => batch,
      } as unknown as admin.firestore.Firestore,
      collection,
      where,
      batch,
    };
  };

  const THRESHOLD = new Date("2026-10-29T00:00:00+09:00");

  it("閾値より古い送信履歴をまとめて削除し、件数を返す", async () => {
    const { db, collection, where, batch } = makeDb(["ref-1", "ref-2"]);

    const deleted = await deleteOldNotifications(db, THRESHOLD);

    expect(deleted).toBe(2);
    expect(collection).toHaveBeenCalledWith("notifications_sent");
    expect(where).toHaveBeenCalledWith("sentAt", "<", THRESHOLD);
    expect(batch.delete.mock.calls).toEqual([["ref-1"], ["ref-2"]]);
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it("対象が無ければ 0 を返す", async () => {
    const { db, batch } = makeDb([]);

    await expect(deleteOldNotifications(db, THRESHOLD)).resolves.toBe(0);
    expect(batch.delete).not.toHaveBeenCalled();
  });

  it("コミットに失敗したらエラーをそのまま投げる", async () => {
    const { db, batch } = makeDb(["ref-1"]);
    batch.commit.mockRejectedValue(new Error("commit failed"));

    await expect(deleteOldNotifications(db, THRESHOLD)).rejects.toThrow(
      "commit failed",
    );
  });
});
