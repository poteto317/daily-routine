import {
  createHomeCurrentDateLabel,
  createInitialHomeViewMode,
  createInitialIsTodayHoliday,
  createSortedDaysAndHoliday,
  setHomeFilterCategoryState,
  setHomeViewModeState,
  toggleHomeEditModeState,
} from "../homeViewStateActions";

describe("homeViewStateActions", () => {
  const days = [
    { value: 0, label: "日曜日" },
    { value: 1, label: "月曜日" },
    { value: 2, label: "火曜日" },
  ];

  it("初期ラベルと祝日 state を作る", () => {
    expect(createHomeCurrentDateLabel(false)).toBe("");
    expect(
      createHomeCurrentDateLabel(true, new Date("2026-03-07T12:00:00+09:00")),
    ).toContain("2026");

    expect(createInitialIsTodayHoliday(false, () => true)).toBe(false);
    expect(createInitialIsTodayHoliday(true, () => true)).toBe(true);
  });

  it("初期 view mode を作る", () => {
    expect(createInitialHomeViewMode(false, () => true, 6)).toBe(6);
    expect(createInitialHomeViewMode(true, () => true, 6)).toBe("holiday");
    expect(createInitialHomeViewMode(true, () => false, 6)).toBe(6);
  });

  it("曜日並びを作る", () => {
    expect(
      createSortedDaysAndHoliday({
        currentDayOfWeek: 1,
        isTodayHoliday: false,
        days,
      }),
    ).toEqual([
      { value: 1, label: "月曜日" },
      { value: 2, label: "火曜日" },
      { value: 0, label: "日曜日" },
      "holiday",
    ]);

    expect(
      createSortedDaysAndHoliday({
        currentDayOfWeek: 1,
        isTodayHoliday: true,
        days,
      })[0],
    ).toBe("holiday");
  });

  it("編集/フィルタ/表示モード state を更新して保存する", () => {
    const setIsEditMode = jest.fn();
    const saveIsEditMode = jest.fn();
    expect(
      toggleHomeEditModeState({
        isEditMode: false,
        setIsEditMode,
        saveIsEditMode,
      }),
    ).toBe(true);
    expect(setIsEditMode).toHaveBeenCalledWith(true);
    expect(saveIsEditMode).toHaveBeenCalledWith(true);

    const setFilterCategory = jest.fn();
    const saveFilterCategory = jest.fn();
    setHomeFilterCategoryState({
      category: "work",
      setFilterCategory,
      saveFilterCategory,
    });
    expect(setFilterCategory).toHaveBeenCalledWith("work");
    expect(saveFilterCategory).toHaveBeenCalledWith("work");

    const setViewMode = jest.fn();
    const saveViewMode = jest.fn();
    setHomeViewModeState({
      mode: "holiday",
      setViewMode,
      saveViewMode,
    });
    expect(setViewMode).toHaveBeenCalledWith("holiday");
    expect(saveViewMode).toHaveBeenCalledWith("holiday");
  });
});
