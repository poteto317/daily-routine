import { act, renderHook } from "@testing-library/react";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";
import { HOLIDAY_DAY_VALUE } from "@/types/routine";
import { resolveHomeRoutineFormDay } from "../../pages/pageViewModelActions";
import { useHomeViewState } from "../useHomeViewState";

// 選択中の曜日のタブ（view.viewMode）の日またぎ（#210）。
// 本物の useJstDay と、本物（useRoutineQueries）と同じく時計に連動する祝日の判定を通す。
// 観測は renderHook の result.current（コミット後の値）で行う。描画中の値を写し取ると、
// React が描画を捨てたとき（同じ state を入れたとき）にも新しい値が見えてしまい、退行を見逃す。
//
// 使う日付（2026 年 11 月。JST）:
//   11/2 月（1）平日 / 11/3 火（2）文化の日 / 11/4 水（3）平日 / 11/5 木（4）平日 / 11/6 金（5）平日
const getIsTodayHoliday = () => isHoliday(getJstToday());

const at = (isoWithOffset: string) => {
  jest.setSystemTime(new Date(isoWithOffset));
};

const renderHomeViewState = (isoWithOffset: string) => {
  jest.useFakeTimers().setSystemTime(new Date(isoWithOffset));
  return renderHook(() => useHomeViewState(getIsTodayHoliday));
};

describe("useHomeViewState の選択中のタブは、選んでいなければ今日に追従する", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("(a) タブを選んでいないとき", () => {
    it("平日→祝日→平日と日をまたいだ後の再描画で、新しい今日のタブになり、ルーティン追加フォームの既定の曜日も変わる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      expect(result.current.viewMode).toBe(1);
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(
        HOLIDAY_DAY_VALUE,
      );

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(3);
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(3);
    });
  });

  describe("(b) 今日以外のタブを選んでいるとき", () => {
    it("日をまたいでも、選んだタブが保たれる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction(5);
      });
      expect(result.current.viewMode).toBe(5);

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(5);
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(5);
    });
  });

  describe("(c) 今日のタブを押したとき", () => {
    it("選択が「今日に追従」に戻り、日をまたぐと新しい今日のタブになる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction(5);
      });
      act(() => {
        result.current.setViewModeAction(1);
      });
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");
    });
  });

  // L-538: 前日に描画し、再描画せずに時計を進めてから押す（描画と最初の操作を同じ時刻にすると、
  // 押した時点の既定のタブと描画時の既定のタブが一致し、どちらで比べる実装でも通ってしまう）
  describe("(e) 前日に描画したまま、再描画せずに日をまたいでから押したとき", () => {
    it("選んでいない（mode: null）まま新しい今日のタブを押すと、再描画されて日付ラベルも新しい日になる", () => {
      const { result } = renderHomeViewState("2026-11-02T23:59:00+09:00");
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction("holiday");
      });

      expect(result.current.viewMode).toBe("holiday");
      expect(result.current.currentDate).toBe("2026年11月3日火曜日");
      expect(result.current.isTodayHoliday).toBe(true);
    });

    it("別のタブを押して今日のタブに戻した（mode: null）あとでも、新しい今日のタブを押すと再描画される", () => {
      const { result } = renderHomeViewState("2026-11-02T23:59:00+09:00");
      act(() => {
        result.current.setViewModeAction(3);
      });
      act(() => {
        result.current.setViewModeAction(1);
      });
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction("holiday");
      });

      expect(result.current.viewMode).toBe("holiday");
      expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    });

    it("新しい今日のタブ（祝日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction("holiday");
      });
      expect(result.current.viewMode).toBe("holiday");

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(3);
    });

    it("新しい今日のタブ（曜日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-04T23:59:00+09:00",
      );
      expect(result.current.viewMode).toBe(3);

      at("2026-11-05T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction(4);
      });
      expect(result.current.viewMode).toBe(4);

      at("2026-11-06T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(5);
    });

    it("表示中の古い今日のタブを押すと、選んだタブとして保たれる（押した時点の既定のタブと比べる）", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction(1);
      });
      expect(result.current.viewMode).toBe(1);
      expect(result.current.currentDate).toBe("2026年11月3日火曜日");

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(1);
    });
  });

  describe("(f) 境界のケースは、選んだタブとして保たれる", () => {
    it("祝日の日に今日の曜日のタブを押すと、次の日もその曜日のまま", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-03T12:00:00+09:00",
      );
      expect(result.current.viewMode).toBe("holiday");
      act(() => {
        result.current.setViewModeAction(2);
      });
      expect(result.current.viewMode).toBe(2);

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(2);
    });

    it("平日に「祝日」タブを押すと、次の日が祝日でもその次の平日でも holiday のまま", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T12:00:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction("holiday");
      });
      expect(result.current.viewMode).toBe("holiday");

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");
    });

    it("前日に翌日の曜日のタブを押すと、翌日に既定のタブと同じになっても選んだまま残り、翌々日もその曜日のまま", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-04T23:00:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction(4);
      });
      expect(result.current.viewMode).toBe(4);

      at("2026-11-05T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(4);

      at("2026-11-06T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(4);
    });
  });
});
