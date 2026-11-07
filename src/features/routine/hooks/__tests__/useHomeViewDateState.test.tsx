import { renderHook } from "@testing-library/react";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";
import { useHomeViewDateState } from "../useHomeViewDateState";

// 祝日の判定は本物と同じく時計に連動させる（useRoutineQueries の getIsTodayHoliday と同じ式）。
// 固定の値を返すスタブでは、日をまたいだ後に新しい今日で判定し直していることを確かめられない
const getIsTodayHoliday = () => isHoliday(getJstToday());

describe("useHomeViewDateState", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("window 利用可なら今日の日付ラベルと祝日フラグを返す", () => {
    // 2026-11-03 は文化の日（火曜）
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewDateState({ canUseWindow: true, getIsTodayHoliday }),
    );

    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);
  });

  it("window 利用不可なら空の日付ラベルと false を返し、祝日の判定関数を呼ばない", () => {
    const getIsTodayHolidayMock = jest.fn(() => true);

    const { result } = renderHook(() =>
      useHomeViewDateState({
        canUseWindow: false,
        getIsTodayHoliday: getIsTodayHolidayMock,
      }),
    );

    expect(result.current.currentDate).toBe("");
    expect(result.current.isTodayHoliday).toBe(false);
    expect(getIsTodayHolidayMock).not.toHaveBeenCalled();
  });

  it("平日から祝日へ日をまたいだ後の再描画で、日付ラベルが新しい日になり祝日フラグが true になる", () => {
    // 2026-11-02（月）は平日、2026-11-03（火）は文化の日
    jest.useFakeTimers().setSystemTime(new Date("2026-11-02T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewDateState({ canUseWindow: true, getIsTodayHoliday }),
    );
    expect(result.current.currentDate).toBe("2026年11月2日月曜日");
    expect(result.current.isTodayHoliday).toBe(false);

    jest.setSystemTime(new Date("2026-11-03T00:01:00+09:00"));
    rerender();

    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);
  });

  it("祝日から平日へ日をまたいだ後の再描画で、日付ラベルが新しい日になり祝日フラグが false になる", () => {
    // 2026-11-03（火）は文化の日、2026-11-04（水）は平日
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewDateState({ canUseWindow: true, getIsTodayHoliday }),
    );
    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);

    jest.setSystemTime(new Date("2026-11-04T00:01:00+09:00"));
    rerender();

    expect(result.current.currentDate).toBe("2026年11月4日水曜日");
    expect(result.current.isTodayHoliday).toBe(false);
  });
});
