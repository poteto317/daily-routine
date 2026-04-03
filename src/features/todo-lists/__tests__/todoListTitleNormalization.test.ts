import { normalizeTodoTitle } from "../todoListTitleNormalization";

describe("normalizeTodoTitle", () => {
  it("前後の空白を除去して返す", () => {
    expect(normalizeTodoTitle("  Hello  ")).toBe("Hello");
  });

  it("空白のみの文字列は null を返す", () => {
    expect(normalizeTodoTitle("   ")).toBeNull();
  });

  it("空文字は null を返す", () => {
    expect(normalizeTodoTitle("")).toBeNull();
  });

  it("空白のない文字列はそのまま返す", () => {
    expect(normalizeTodoTitle("Task")).toBe("Task");
  });

  it("内側の空白は保持する", () => {
    expect(normalizeTodoTitle("  Hello World  ")).toBe("Hello World");
  });
});
