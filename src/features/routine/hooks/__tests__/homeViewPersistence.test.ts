import {
  getStoredFilterCategory,
  getStoredIsEditMode,
  getStoredViewMode,
  saveFilterCategory,
  saveIsEditMode,
  saveViewMode,
} from "../homeViewPersistence";

describe("homeViewPersistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("不正なfilterCategoryはallへフォールバックする", () => {
    localStorage.setItem("filterCategory", "invalid");

    expect(getStoredFilterCategory()).toBe("all");
  });

  it("祝日の日は保存値に関わらずholidayを返す", () => {
    localStorage.setItem("viewMode", "3");

    expect(getStoredViewMode(true, 5)).toBe("holiday");
  });

  it("viewModeに不正な値が保存されていた場合は当日曜日を返す", () => {
    localStorage.setItem("viewMode", "99");

    expect(getStoredViewMode(false, 2)).toBe(2);
  });

  it("保存ヘルパーは対応するキーへ書き込む", () => {
    saveFilterCategory("health");
    saveViewMode("holiday");
    saveIsEditMode(false);

    expect(localStorage.getItem("filterCategory")).toBe("health");
    expect(localStorage.getItem("viewMode")).toBe("holiday");
    expect(localStorage.getItem("isEditMode")).toBe("false");
  });

  it("isEditMode未保存時はtrue、false保存時のみfalseを返す", () => {
    expect(getStoredIsEditMode()).toBe(true);

    localStorage.setItem("isEditMode", "false");
    expect(getStoredIsEditMode()).toBe(false);
  });
});
