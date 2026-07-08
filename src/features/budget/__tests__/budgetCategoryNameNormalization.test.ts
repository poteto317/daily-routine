import { normalizeCategoryName } from "../budgetCategoryNameNormalization";

describe("normalizeCategoryName", () => {
  it("前後の空白を取り除いた名前を返す", () => {
    expect(normalizeCategoryName("  食料品  ")).toBe("食料品");
  });

  it("空文字・空白のみの場合はnullを返す", () => {
    expect(normalizeCategoryName("")).toBeNull();
    expect(normalizeCategoryName("   ")).toBeNull();
  });
});
