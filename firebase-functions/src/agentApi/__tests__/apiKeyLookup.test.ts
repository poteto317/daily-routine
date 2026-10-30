/** @jest-environment node */
import type * as admin from "firebase-admin";
import { hashApiKey } from "../apiKey";
import { resolveUidByApiKey } from "../apiKeyLookup";

const VALID_KEY = `drk_${"A".repeat(43)}`;

const fakeDb = (docs: Record<string, Record<string, unknown>>) => {
  const get = jest.fn(async (id: string) => ({
    exists: id in docs,
    data: () => docs[id],
  }));
  const collection = jest.fn((name: string) => ({
    doc: (id: string) => ({ get: () => get(id) }),
    name,
  }));
  return {
    db: { collection } as unknown as admin.firestore.Firestore,
    get,
    collection,
  };
};

describe("resolveUidByApiKey", () => {
  it("apiKeys コレクションをハッシュで引いて uid を返す", async () => {
    const { db, get, collection } = fakeDb({
      [hashApiKey(VALID_KEY)]: { uid: "user-1" },
    });
    await expect(resolveUidByApiKey(db, VALID_KEY)).resolves.toBe("user-1");
    expect(collection).toHaveBeenCalledWith("apiKeys");
    expect(get).toHaveBeenCalledWith(hashApiKey(VALID_KEY));
  });

  it("形式不正のキーは Firestore を引かずに null", async () => {
    const { db, collection } = fakeDb({});
    await expect(resolveUidByApiKey(db, "bad")).resolves.toBeNull();
    expect(collection).not.toHaveBeenCalled();
  });

  it("未登録（失効＝ドキュメント削除を含む）は null", async () => {
    await expect(
      resolveUidByApiKey(fakeDb({}).db, VALID_KEY),
    ).resolves.toBeNull();
  });

  it.each([{ uid: 1 }, { uid: "" }, { uid: null }, {}])(
    "uid が空でない文字列でないドキュメント %j は null",
    async (doc) => {
      const { db } = fakeDb({ [hashApiKey(VALID_KEY)]: doc });
      await expect(resolveUidByApiKey(db, VALID_KEY)).resolves.toBeNull();
    },
  );

  it("ドキュメントは存在するが data() が undefined なら null", async () => {
    const collection = jest.fn(() => ({
      doc: () => ({
        get: async () => ({ exists: true, data: () => undefined }),
      }),
    }));
    const db = { collection } as unknown as admin.firestore.Firestore;
    await expect(resolveUidByApiKey(db, VALID_KEY)).resolves.toBeNull();
  });
});
