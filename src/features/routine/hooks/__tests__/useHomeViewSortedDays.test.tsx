import { renderHook } from "@testing-library/react";
import { useHomeViewSortedDays } from "../useHomeViewSortedDays";

describe("useHomeViewSortedDays", () => {
  it("祝日なら holiday を先頭に並べる", () => {
    const { result } = renderHook(() =>
      useHomeViewSortedDays({
        currentDayOfWeek: 1,
        isTodayHoliday: true,
      }),
    );

    expect(result.current[0]).toBe("holiday");
  });

  it("平日なら holiday を末尾に並べる", () => {
    const { result } = renderHook(() =>
      useHomeViewSortedDays({
        currentDayOfWeek: 1,
        isTodayHoliday: false,
      }),
    );

    expect(result.current[result.current.length - 1]).toBe("holiday");
  });
});
