/** @jest-environment node */
import { createFakeFirestore } from "./fakeFirestore";

describe("createFakeFirestore（実 SDK の制約の再現）", () => {
  it("トランザクションの書き込みはコミット時に反映される（set / update / delete）", async () => {
    const fake = createFakeFirestore({
      "users/u1": { a: 1, b: 2 },
      "users/u1/syncSnapshots/s1": { uploadedAt: 1 },
    });
    await fake.db.runTransaction(async (tx) => {
      const ref = fake.db.collection("users").doc("u1");
      tx.update(ref, { b: 3, c: 4 });
      tx.set(ref.collection("syncSnapshots").doc("s2"), { uploadedAt: 2 });
      tx.delete(ref.collection("syncSnapshots").doc("s1"));
    });
    expect(fake.get("users/u1")).toEqual({ a: 1, b: 3, c: 4 });
    expect(fake.get("users/u1/syncSnapshots/s2")).toEqual({ uploadedAt: 2 });
    expect(fake.get("users/u1/syncSnapshots/s1")).toBeUndefined();
  });

  it("書き込み後の読み取りは失敗する（読み取りは書き込みより先）", async () => {
    const fake = createFakeFirestore({ "users/u1": { a: 1 } });
    const ref = fake.db.collection("users").doc("u1");
    await expect(
      fake.db.runTransaction(async (tx) => {
        tx.update(ref, { a: 2 });
        await tx.get(ref);
      }),
    ).rejects.toThrow(/reads to be executed before all writes/);
    expect(fake.get("users/u1")).toEqual({ a: 1 });
  });

  it("存在しないドキュメントへの update はコミット時に失敗し、他の書き込みも反映されない", async () => {
    const fake = createFakeFirestore({ "users/u1": { a: 1 } });
    await expect(
      fake.db.runTransaction(async (tx) => {
        tx.update(fake.db.collection("users").doc("u1"), { a: 2 });
        tx.update(fake.db.collection("users").doc("missing"), { a: 1 });
      }),
    ).rejects.toThrow(/NOT_FOUND/);
    expect(fake.get("users/u1")).toEqual({ a: 1 });
    expect(fake.get("users/missing")).toBeUndefined();
  });

  it("コールバックが失敗したら書き込みは反映されない", async () => {
    const fake = createFakeFirestore({ "users/u1": { a: 1 } });
    await expect(
      fake.db.runTransaction(async (tx) => {
        tx.update(fake.db.collection("users").doc("u1"), { a: 2 });
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(fake.get("users/u1")).toEqual({ a: 1 });
  });

  it("トランザクション内の読み取りはコミット前の状態を返す", async () => {
    const fake = createFakeFirestore({ "users/u1": { a: 1 } });
    const ref = fake.db.collection("users").doc("u1");
    let seen: unknown;
    await fake.db.runTransaction(async (tx) => {
      const before = await tx.get(ref);
      seen = before.data();
      tx.update(ref, { a: 2 });
    });
    expect(seen).toEqual({ a: 1 });
    expect(fake.get("users/u1")).toEqual({ a: 2 });
  });

  it("クエリは uploadedAt の降順で、select したフィールドだけを返す", async () => {
    const fake = createFakeFirestore({
      "users/u1/syncSnapshots/s1": {
        uploadedAt: 1,
        deviceId: "a",
        data: { big: 1 },
      },
      "users/u1/syncSnapshots/s2": {
        uploadedAt: 3,
        deviceId: "b",
        data: { big: 2 },
      },
      "users/u1/syncSnapshots/s3": {
        uploadedAt: 2,
        deviceId: "c",
        data: { big: 3 },
      },
      "users/u1/other/x": { uploadedAt: 99 },
    });
    const query = fake.db
      .collection("users")
      .doc("u1")
      .collection("syncSnapshots")
      .orderBy("uploadedAt", "desc")
      .select("deviceId");
    const snapshot = await fake.db.runTransaction((tx) => tx.get(query));
    expect(snapshot.docs.map((doc) => doc.id)).toEqual(["s2", "s3", "s1"]);
    expect(snapshot.docs[0].data()).toEqual({ deviceId: "b" });
  });

  it("select しないクエリは全フィールドを返す", async () => {
    const fake = createFakeFirestore({
      "users/u1/syncSnapshots/s1": { uploadedAt: 1, deviceId: "a" },
    });
    const query = fake.db
      .collection("users")
      .doc("u1")
      .collection("syncSnapshots")
      .orderBy("uploadedAt", "desc");
    const snapshot = await fake.db.runTransaction((tx) => tx.get(query));
    expect(snapshot.docs[0].data()).toEqual({ uploadedAt: 1, deviceId: "a" });
  });

  it("doc() に ID を省略すると自動 ID を採番する", () => {
    const fake = createFakeFirestore({});
    const collection = fake.db.collection("users").doc("u1").collection("x");
    expect(collection.doc().id).not.toBe(collection.doc().id);
  });
});
