import { createInitialHomeViewControlState } from "../homeViewControlStateActions";

describe("homeViewControlStateActions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存済み filter/edit 状態と初期 view mode をまとめて構築する", () => {
    localStorage.setItem("filterCategory", "health");
    localStorage.setItem("isEditMode", "false");

    expect(
      createInitialHomeViewControlState({
        canUseWindow: true,
        currentDayOfWeek: 3,
        getIsTodayHoliday: () => false,
      }),
    ).toEqual({
      filterCategory: "health",
      isEditMode: false,
      viewMode: 3,
    });
  });

  it("祝日なら初期 view mode を holiday にする", () => {
    expect(
      createInitialHomeViewControlState({
        canUseWindow: true,
        currentDayOfWeek: 2,
        getIsTodayHoliday: () => true,
      }).viewMode,
    ).toBe("holiday");
  });
});
