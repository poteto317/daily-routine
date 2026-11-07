import {
  createDefaultHomeViewMode,
  createHomeCurrentDateLabel,
  createIsTodayHoliday,
  createSortedDaysAndHoliday,
  resolveHomeViewMode,
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

  it("日付ラベルと祝日フラグを作る", () => {
    expect(createHomeCurrentDateLabel(false)).toBe("");
    expect(
      createHomeCurrentDateLabel(true, new Date("2026-03-07T12:00:00+09:00")),
    ).toContain("2026");

    expect(createIsTodayHoliday(false, () => true)).toBe(false);
    expect(createIsTodayHoliday(true, () => true)).toBe(true);
  });

  it("既定のタブは、祝日なら holiday、そうでなければ今日の曜日（window が無いときは今日の曜日）", () => {
    expect(createDefaultHomeViewMode(true, false, 6)).toBe(6);
    expect(createDefaultHomeViewMode(true, true, 6)).toBe("holiday");
    expect(createDefaultHomeViewMode(false, true, 6)).toBe(6);
    expect(createDefaultHomeViewMode(false, false, 0)).toBe(0);
  });

  it("表示するタブは、選んだタブがあればそれ、無ければ（mode が null）既定のタブ", () => {
    expect(resolveHomeViewMode({ mode: null }, 3)).toBe(3);
    expect(resolveHomeViewMode({ mode: null }, "holiday")).toBe("holiday");
    expect(resolveHomeViewMode({ mode: 5 }, 3)).toBe(5);
    expect(resolveHomeViewMode({ mode: "holiday" }, 3)).toBe("holiday");
    // 日曜（0）は falsy だが、選んだタブとして扱う
    expect(resolveHomeViewMode({ mode: 0 }, 3)).toBe(0);
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

  it("編集/フィルタ state を更新して保存する", () => {
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
  });

  it("表示モードは、押したタブが既定のタブと違えば選んだタブに、同じなら mode: null にし、押したタブを保存する", () => {
    const setSelectedViewMode = jest.fn();
    const saveViewMode = jest.fn();

    setHomeViewModeState({
      mode: "holiday",
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode,
    });
    expect(setSelectedViewMode).toHaveBeenLastCalledWith({ mode: "holiday" });
    expect(saveViewMode).toHaveBeenLastCalledWith("holiday");

    setHomeViewModeState({
      mode: 3,
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode,
    });
    expect(setSelectedViewMode).toHaveBeenLastCalledWith({ mode: null });
    expect(saveViewMode).toHaveBeenLastCalledWith(3);

    // 祝日の日に今日の曜日のタブを押すと、既定（holiday）と違うので選んだタブになる
    setHomeViewModeState({
      mode: 2,
      defaultViewMode: "holiday",
      setSelectedViewMode,
      saveViewMode,
    });
    expect(setSelectedViewMode).toHaveBeenLastCalledWith({ mode: 2 });
  });

  it("既定のタブを続けて押しても、毎回新しいオブジェクトを入れる（mode が null のままでも再描画させる）", () => {
    const setSelectedViewMode = jest.fn();
    const params = {
      mode: 3,
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode: jest.fn(),
    };

    setHomeViewModeState(params);
    setHomeViewModeState(params);

    const [[first], [second]] = setSelectedViewMode.mock.calls;
    expect(first).toEqual({ mode: null });
    expect(second).toEqual({ mode: null });
    expect(second).not.toBe(first);
  });
});
