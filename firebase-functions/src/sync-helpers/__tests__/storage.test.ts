/** @jest-environment node */
import { createHash } from "node:crypto";
import type { Firestore } from "../../adminSdk";
import { saveNotificationSubscription } from "../storage";

jest.mock("../../adminSdk", () => ({
  FieldValue: { serverTimestamp: () => "SERVER_TIMESTAMP" },
}));

const makeDb = () => {
  const subscriptions = new Map<string, { ownerUid: string }>();
  const get = jest.fn(async ({ id }: { id: string }) => ({
    exists: subscriptions.has(id),
    data: () => subscriptions.get(id),
  }));
  const set = jest.fn((ref: { id: string }, body: { ownerUid: string }) => {
    subscriptions.set(ref.id, body);
  });
  const doc = jest.fn((id: string) => ({ id }));
  const collection = jest.fn(() => ({ doc }));
  // Emulator を必要としない形で、先行トランザクションがコミット済みの状態を後続に渡す。
  let queue: Promise<unknown> = Promise.resolve();
  const runTransaction = jest.fn(
    (run: (tx: { get: typeof get; set: typeof set }) => Promise<unknown>) => {
      const task = queue.then(() => run({ get, set }));
      queue = task.catch(() => undefined);
      return task;
    },
  );
  return {
    db: { collection, runTransaction } as unknown as Firestore,
    collection,
    doc,
    set,
    subscriptions,
  };
};
const token = "device-registration";
const tokenHash = createHash("sha256").update(token).digest("hex");
const routines = [
  { id: "r1", title: "Routine", startTime: "09:00", daysOfWeek: [1] },
];

it("通知専用コレクションへ、トークンのハッシュをキーに所有者と設定を保存する", async () => {
  const { db, collection, doc, set } = makeDb();

  await expect(
    saveNotificationSubscription(db, "owner", token, routines),
  ).resolves.toBe(true);
  expect(collection.mock.calls).toEqual([["notificationSubscriptions"]]);
  expect(doc).toHaveBeenCalledWith(tokenHash);
  expect(set).toHaveBeenCalledWith(
    { id: tokenHash },
    {
      ownerUid: "owner",
      fcmToken: token,
      routines,
      updatedAt: "SERVER_TIMESTAMP",
    },
  );
});

it("同じ端末を2人が登録しても、先に確定した所有者の書き込みだけを通す", async () => {
  const { db, set, subscriptions } = makeDb();
  const register = (uid: string, fcmToken: string) =>
    saveNotificationSubscription(db, uid, fcmToken, []);
  await expect(
    Promise.all([register("first", token), register("second", token)]),
  ).resolves.toEqual([true, false]);
  expect(set).toHaveBeenCalledTimes(1);
  expect(subscriptions.get(tokenHash)?.ownerUid).toBe("first");

  await expect(register("first", token)).resolves.toBe(true);
  await expect(register("first", "second-device")).resolves.toBe(true);
  expect(subscriptions.size).toBe(2);
});
