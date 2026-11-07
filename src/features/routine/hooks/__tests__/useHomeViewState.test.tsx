import { act, renderHook } from "@testing-library/react";
import { useHomeViewState } from "../useHomeViewState";

describe("useHomeViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("祝日ならviewMode初期値をholidayにする", () => {
    localStorage.setItem("viewMode", "1");

    const { result } = renderHook(() => useHomeViewState(() => true));

    expect(result.current.isTodayHoliday).toBe(true);
    expect(result.current.viewMode).toBe("holiday");
    expect(result.current.sortedDaysAndHoliday[0]).toBe("holiday");
  });

  it("祝日でない場合は保存済みviewMode/filterCategoryを復元する", () => {
    // viewMode の初期値は JST の曜日。端末ローカルの getDay() を期待値に使うと
    // 日本国外で別の曜日になるため、瞬間を固定して JST の曜日を直接書く。
    // 2026-08-13 22:00 UTC = 2026-08-14 07:00 JST（金曜 = 5）
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T22:00:00Z"));
    const today = 5;
    localStorage.setItem("viewMode", "3");
    localStorage.setItem("filterCategory", "health");
    localStorage.setItem("isEditMode", "false");

    const { result } = renderHook(() => useHomeViewState(() => false));

    expect(result.current.viewMode).toBe(today);
    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(false);
  });

  // Jest は React Compiler を通らないので、このテストは固定（メモ化）の退行を検出しない。
  // 固定の検出は src/__tests__/reactCompilerToday.contract.test.ts（契約テスト）と、共通フックの配線テストが担う
  it("日をまたいだ後の再描画で、曜日の並び順の先頭が新しい今日の曜日になる", () => {
    // 2026-08-14 23:59 JST は金曜（5）、2026-08-15 00:01 JST は土曜（6）
    jest.useFakeTimers().setSystemTime(new Date("2026-08-14T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewState(() => false),
    );
    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 5 }),
    );

    jest.setSystemTime(new Date("2026-08-15T00:01:00+09:00"));
    rerender();

    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 6 }),
    );
    // 選択中の曜日は初期 state のまま（設計書「既知の制約と懸念」3）
    expect(result.current.viewMode).toBe(5);
  });

  it("setFilterCategoryAction/setViewModeAction/toggleEditModeActionでlocalStorageを更新する", () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useHomeViewState(() => false));

    act(() => {
      result.current.setFilterCategoryAction("work");
      result.current.setViewModeAction(5);
      result.current.toggleEditModeAction();
    });

    expect(setItemSpy).toHaveBeenCalledWith("filterCategory", "work");
    expect(setItemSpy).toHaveBeenCalledWith("viewMode", "5");
    expect(setItemSpy).toHaveBeenCalledWith("isEditMode", expect.any(String));

    setItemSpy.mockRestore();
  });
});
