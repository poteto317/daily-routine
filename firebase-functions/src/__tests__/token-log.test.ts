/** @jest-environment node */
import { abbreviateTokenForLog } from "../token-log";

describe("abbreviateTokenForLog", () => {
  it("先頭 20 文字だけを残して末尾に ... を付ける", () => {
    expect(abbreviateTokenForLog("0123456789abcdefghijKLMNOP")).toBe(
      "0123456789abcdefghij...",
    );
  });

  it("ちょうど 20 文字ならそのまま ... を付ける", () => {
    expect(abbreviateTokenForLog("0123456789abcdefghij")).toBe(
      "0123456789abcdefghij...",
    );
  });

  it("20 文字未満でも ... を付ける", () => {
    expect(abbreviateTokenForLog("short")).toBe("short...");
  });
});
