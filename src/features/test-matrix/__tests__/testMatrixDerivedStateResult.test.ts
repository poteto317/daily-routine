import { createTestMatrixDerivedStateResult } from "../testMatrixDerivedStateResult";

describe("createTestMatrixDerivedStateResult", () => {
  it("selected item と overview stats の公開 shape を返す", () => {
    const selectedItem = {
      id: "1-1",
      label: "ログイン",
      pc: "unchecked" as const,
      sp: "unchecked" as const,
      note: "",
    };
    const overviewStats = {
      totalCount: 1,
      okCount: 0,
      ngCount: 0,
      uncheckedCount: 1,
      progressPct: 0,
    };

    expect(
      createTestMatrixDerivedStateResult({
        selectedItem,
        overviewStats,
      }),
    ).toEqual({
      selectedItem,
      overviewStats,
    });
  });
});
