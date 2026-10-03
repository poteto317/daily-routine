import { createHash, webcrypto } from "crypto";
import { TextEncoder } from "util";
import { API_KEY_PREFIX, generateApiKey, hashApiKey } from "../apiKeyGenerator";

beforeAll(() => {
  // jsdom には crypto.subtle が無いため Node の webcrypto を使う
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
  // jsdom には TextEncoder も無いため Node のものを使う
  Object.defineProperty(globalThis, "TextEncoder", {
    value: TextEncoder,
    configurable: true,
  });
});

describe("generateApiKey", () => {
  it("drk_ + base64url 43 文字（サーバーの API_KEY_PATTERN と同じ形式）", () => {
    const key = generateApiKey();
    expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(key).toMatch(/^drk_[A-Za-z0-9_-]{43}$/);
  });

  it("呼び出しごとに異なるキーを返す", () => {
    expect(generateApiKey()).not.toBe(generateApiKey());
  });
});

describe("hashApiKey", () => {
  it("Node の SHA-256 小文字 hex と一致する（サーバーと同値）", async () => {
    const key = `drk_${"A".repeat(43)}`;
    await expect(hashApiKey(key)).resolves.toBe(
      createHash("sha256").update(key, "utf8").digest("hex"),
    );
  });
});
