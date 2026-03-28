import { act, renderHook } from "@testing-library/react";
import { useHomeViewState } from "../useHomeViewState";

describe("useHomeViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("祝日ならviewMode初期値をholidayにする", () => {
    localStorage.setItem("viewMode", "1");

    const { result } = renderHook(() => useHomeViewState(() => true));

    expect(result.current.isTodayHoliday).toBe(true);
    expect(result.current.viewMode).toBe("holiday");
    expect(result.current.sortedDaysAndHoliday[0]).toBe("holiday");
  });

  it("祝日でない場合は保存済みviewMode/filterCategoryを復元する", () => {
    const today = new Date().getDay();
    localStorage.setItem("viewMode", "3");
    localStorage.setItem("filterCategory", "health");
    localStorage.setItem("isEditMode", "false");

    const { result } = renderHook(() => useHomeViewState(() => false));

    expect(result.current.viewMode).toBe(today);
    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(false);
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
