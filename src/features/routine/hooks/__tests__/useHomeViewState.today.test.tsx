import { renderHook } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstDay: jest.fn(),
}));

import { useJstDay } from "@/hooks/useToday";
import { useHomeViewState } from "../useHomeViewState";

// 曜日の並び順は、共通フック useJstDay の曜日で決める。
// 時計（2026-08-14 金曜 = 5）と違う曜日をフックから返し、フックの値が使われることを確かめる
describe("useHomeViewState の今日の曜日は共通フック useJstDay から取る", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-08-14T12:00:00+09:00"));
    (useJstDay as jest.Mock).mockReturnValue(3);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの曜日を並び順の先頭にし、再描画でフックの曜日が変わると先頭が追いつく", () => {
    const { result, rerender } = renderHook(() =>
      useHomeViewState(() => false),
    );
    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 3 }),
    );

    (useJstDay as jest.Mock).mockReturnValue(4);
    rerender();

    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 4 }),
    );
    // タブを選んでいなければ、表示するタブもフックの曜日に追いつく（#210）。
    // setViewModeAction の既定のタブとの比較は、ここでは確かめない（押した時点の曜日は
    // toJstDay(new Date()) から取るので、モックの曜日と食い違う。useHomeViewState.viewMode.test.tsx で確かめる）
    expect(result.current.viewMode).toBe(4);
  });
});
