/** @jest-environment node */
import type { Firestore } from "../../adminSdk";

jest.mock("../../adminSdk", () => ({
  FieldValue: { serverTimestamp: () => "SERVER_TIMESTAMP" },
}));

import { saveUserData } from "../storage";

const makeDb = () => {
  const set = jest.fn().mockResolvedValue(undefined);
  const doc = jest.fn(() => ({ set }));
  const collection = jest.fn(() => ({ doc }));
  return {
    db: { collection } as unknown as Firestore,
    collection,
    doc,
    set,
  };
};

describe("saveUserData", () => {
  it("FCM トークンをドキュメント ID として users に保存する", async () => {
    const { db, collection, doc, set } = makeDb();
    const routines = [{ id: "r1" }];

    await saveUserData(db, "token-abc", routines);

    expect(collection).toHaveBeenCalledWith("users");
    expect(doc).toHaveBeenCalledWith("token-abc");
    expect(set).toHaveBeenCalledWith({
      fcmToken: "token-abc",
      routines,
      updatedAt: "SERVER_TIMESTAMP",
    });
  });

  it("書き込みに失敗したらエラーをそのまま投げる", async () => {
    const { db, set } = makeDb();
    set.mockRejectedValue(new Error("write failed"));

    await expect(saveUserData(db, "token-abc", [])).rejects.toThrow(
      "write failed",
    );
  });
});
