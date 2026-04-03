import { normalizeTitle } from "../todoListTitleNormalization";

describe("normalizeTitle", () => {
  it("前後の空白を除去して返す", () => {
    expect(normalizeTitle("  Hello  ")).toBe("Hello");
  });

  it("空白のみの文字列は null を返す", () => {
    expect(normalizeTitle("   ")).toBeNull();
  });

  it("空文字は null を返す", () => {
    expect(normalizeTitle("")).toBeNull();
  });

  it("空白のない文字列はそのまま返す", () => {
    expect(normalizeTitle("Task")).toBe("Task");
  });

  it("内側の空白は保持する", () => {
    expect(normalizeTitle("  Hello World  ")).toBe("Hello World");
  });
});
