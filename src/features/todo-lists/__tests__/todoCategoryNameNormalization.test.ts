import { normalizeCategoryName } from "../todoCategoryNameNormalization";

describe("normalizeCategoryName", () => {
  it("前後の空白を取り除いた名前を返す", () => {
    expect(normalizeCategoryName("  仕事  ")).toBe("仕事");
  });

  it("空文字・空白のみの場合はnullを返す", () => {
    expect(normalizeCategoryName("")).toBeNull();
    expect(normalizeCategoryName("   ")).toBeNull();
  });
});
