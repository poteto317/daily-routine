import { renderHook } from "@testing-library/react";
import { useHomeViewDateState } from "../useHomeViewDateState";

describe("useHomeViewDateState", () => {
  it("window 利用可なら日付文字列と祝日 state を初期化する", () => {
    const { result } = renderHook(() =>
      useHomeViewDateState({
        canUseWindow: true,
        getIsTodayHoliday: () => true,
      }),
    );

    expect(result.current.currentDate).toBeTruthy();
    expect(result.current.isTodayHoliday).toBe(true);
  });

  it("window 利用不可なら空日付と非祝日で初期化する", () => {
    const getIsTodayHoliday = jest.fn(() => true);

    const { result } = renderHook(() =>
      useHomeViewDateState({
        canUseWindow: false,
        getIsTodayHoliday,
      }),
    );

    expect(result.current.currentDate).toBe("");
    expect(result.current.isTodayHoliday).toBe(false);
    expect(getIsTodayHoliday).not.toHaveBeenCalled();
  });
});
