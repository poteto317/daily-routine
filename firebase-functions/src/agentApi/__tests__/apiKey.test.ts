/** @jest-environment node */
import { createHash } from "crypto";
import { API_KEY_PATTERN, hashApiKey } from "../apiKey";

const VALID_KEY = `drk_${"A".repeat(43)}`;

describe("hashApiKey", () => {
  it("UTF-8 文字列の SHA-256 小文字 hex を返す", () => {
    expect(hashApiKey(VALID_KEY)).toBe(
      createHash("sha256").update(VALID_KEY, "utf8").digest("hex"),
    );
  });

  it("64 桁の hex で、キーが違えば値も違う", () => {
    expect(hashApiKey(VALID_KEY)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashApiKey(VALID_KEY)).not.toBe(hashApiKey(`drk_${"B".repeat(43)}`));
  });
});

describe("API_KEY_PATTERN", () => {
  it("drk_ + 43 文字の base64url のみ許可する", () => {
    expect(API_KEY_PATTERN.test(VALID_KEY)).toBe(true);
    expect(API_KEY_PATTERN.test(`drk_${"a-_Z9".repeat(8)}abc`)).toBe(true);
    expect(API_KEY_PATTERN.test(`drk_${"A".repeat(42)}`)).toBe(false);
    expect(API_KEY_PATTERN.test(`drk_${"A".repeat(44)}`)).toBe(false);
    expect(API_KEY_PATTERN.test(`xxx_${"A".repeat(43)}`)).toBe(false);
    expect(API_KEY_PATTERN.test(`drk_${"+".repeat(43)}`)).toBe(false);
  });

  it("末尾の改行・前後の空白は許可しない", () => {
    expect(API_KEY_PATTERN.test(`${VALID_KEY}\n`)).toBe(false);
    expect(API_KEY_PATTERN.test(` ${VALID_KEY}`)).toBe(false);
  });
});
