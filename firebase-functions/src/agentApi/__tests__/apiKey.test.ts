/** @jest-environment node */
import { createHash } from "crypto";
import type * as admin from "firebase-admin";
import {
  API_KEY_PATTERN,
  extractBearerToken,
  hashApiKey,
  resolveUidByApiKey,
} from "../apiKey";

const VALID_KEY = `drk_${"A".repeat(43)}`;

const fakeDb = (docs: Record<string, Record<string, unknown>>) => {
  const get = jest.fn(async (id: string) => ({
    exists: id in docs,
    data: () => docs[id],
  }));
  const db = {
    collection: (name: string) => {
      expect(name).toBe("apiKeys");
      return { doc: (id: string) => ({ get: () => get(id) }) };
    },
  };
  return { db: db as unknown as admin.firestore.Firestore, get };
};

describe("hashApiKey", () => {
  it("UTF-8 文字列の SHA-256 小文字 hex を返す", () => {
    expect(hashApiKey(VALID_KEY)).toBe(
      createHash("sha256").update(VALID_KEY, "utf8").digest("hex"),
    );
  });
});

describe("API_KEY_PATTERN", () => {
  it("drk_ + 43 文字の base64url のみ許可する", () => {
    expect(API_KEY_PATTERN.test(VALID_KEY)).toBe(true);
    expect(API_KEY_PATTERN.test(`drk_${"A".repeat(42)}`)).toBe(false);
    expect(API_KEY_PATTERN.test(`xxx_${"A".repeat(43)}`)).toBe(false);
    expect(API_KEY_PATTERN.test(`drk_${"+".repeat(43)}`)).toBe(false);
  });
});

describe("extractBearerToken", () => {
  it("Bearer トークンを取り出す", () => {
    expect(extractBearerToken("Bearer abc")).toBe("abc");
  });

  it.each([undefined, "", "Basic abc", "Bearer", "Bearer ", "bearer abc x"])(
    "%p は null",
    (header) => {
      expect(extractBearerToken(header)).toBeNull();
    },
  );
});

describe("resolveUidByApiKey", () => {
  it("ハッシュで引いた uid を返す", async () => {
    const { db, get } = fakeDb({ [hashApiKey(VALID_KEY)]: { uid: "user-1" } });
    await expect(resolveUidByApiKey(db, VALID_KEY)).resolves.toBe("user-1");
    expect(get).toHaveBeenCalledWith(hashApiKey(VALID_KEY));
  });

  it("形式不正のキーは Firestore を引かずに null", async () => {
    const { db, get } = fakeDb({});
    await expect(resolveUidByApiKey(db, "bad")).resolves.toBeNull();
    expect(get).not.toHaveBeenCalled();
  });

  it("未登録、uid が文字列でないドキュメントは null", async () => {
    await expect(resolveUidByApiKey(fakeDb({}).db, VALID_KEY)).resolves.toBeNull();
    const { db } = fakeDb({ [hashApiKey(VALID_KEY)]: { uid: 1 } });
    await expect(resolveUidByApiKey(db, VALID_KEY)).resolves.toBeNull();
  });
});
