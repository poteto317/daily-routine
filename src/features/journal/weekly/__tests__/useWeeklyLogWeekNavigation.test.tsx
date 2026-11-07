import { act, renderHook } from "@testing-library/react";
import { useWeeklyLogWeekNavigation } from "../useWeeklyLogWeekNavigation";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  getTodayString: jest.fn(),
}));

const mockToday = coreStorage.getTodayString as jest.Mock;

describe("useWeeklyLogWeekNavigation", () => {
  beforeEach(() => {
    mockToday.mockReturnValue("2026-11-07"); // 土曜（2026-11-02 の週）
  });

  const render = (current: string, locked: boolean) =>
    renderHook(
      ({ week, isLocked }) => useWeeklyLogWeekNavigation(week, isLocked),
      { initialProps: { week: current, isLocked: locked } },
    );

  it("最初は今週を選び、次へは進めない", () => {
    const { result } = render("2026-11-02", false);
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    expect(result.current.canNavigate).toBe(true);
    expect(result.current.canGoNext).toBe(false);
  });

  it("前の週へ移り、今週までは戻れるが未来へは進めない", () => {
    const { result } = render("2026-11-02", false);
    act(() => result.current.goToPreviousWeek());
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
    expect(result.current.canGoNext).toBe(true);
    act(() => result.current.goToNextWeek());
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    act(() => result.current.goToNextWeek());
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("openWeek で任意の週へ移る", () => {
    const { result } = render("2026-11-02", false);
    act(() => result.current.openWeek("2026-09-07"));
    expect(result.current.selectedWeekStart).toBe("2026-09-07");
  });

  it("ロック中はどの移動もしない", () => {
    const { result, rerender } = render("2026-11-02", false);
    act(() => result.current.goToPreviousWeek());
    rerender({ week: "2026-11-02", isLocked: true });
    expect(result.current.canNavigate).toBe(false);
    expect(result.current.canGoNext).toBe(false);

    act(() => result.current.goToPreviousWeek());
    act(() => result.current.goToNextWeek());
    act(() => result.current.openWeek("2026-09-07"));
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
  });

  it("何も選んでいなければ、日をまたいだ今週に追いつく", () => {
    const { result, rerender } = render("2026-11-02", false);
    rerender({ week: "2026-11-09", isLocked: false });
    expect(result.current.selectedWeekStart).toBe("2026-11-09");
    expect(result.current.canGoNext).toBe(false);
  });

  it("前後の移動・openWeek で選んだ週は日をまたいでも保つ", () => {
    const { result, rerender } = render("2026-11-02", false);
    act(() => result.current.goToPreviousWeek());
    rerender({ week: "2026-11-09", isLocked: false });
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
    act(() => result.current.openWeek("2026-09-07"));
    rerender({ week: "2026-11-16", isLocked: false });
    expect(result.current.selectedWeekStart).toBe("2026-09-07");
  });

  it("前の週から今週へ戻ったら追従に戻り、日をまたぐと新しい今週を選ぶ", () => {
    const { result, rerender } = render("2026-11-02", false);
    act(() => result.current.goToPreviousWeek());
    act(() => result.current.goToNextWeek());
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    rerender({ week: "2026-11-09", isLocked: false });
    expect(result.current.selectedWeekStart).toBe("2026-11-09");
  });

  it("openWeek で今週を選んだら追従に戻り、日をまたぐと新しい今週を選ぶ", () => {
    const { result, rerender } = render("2026-11-02", false);
    act(() => result.current.openWeek("2026-09-07"));
    act(() => result.current.openWeek("2026-11-02"));
    rerender({ week: "2026-11-09", isLocked: false });
    expect(result.current.selectedWeekStart).toBe("2026-11-09");
  });

  it("selectWeek はロック中でも週を選べ、今週なら追従に戻る", () => {
    const { result, rerender } = render("2026-11-02", true);
    act(() => result.current.selectWeek("2026-10-26"));
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
    act(() => result.current.selectWeek("2026-11-02"));
    rerender({ week: "2026-11-09", isLocked: true });
    expect(result.current.selectedWeekStart).toBe("2026-11-09");
  });

  it("再描画の無いまま日をまたいだ後に次の週へ進むと、描画時の今週でも呼ばれた時点で今週でなければ選んだ週として保つ", () => {
    const { result, rerender } = render("2026-11-02", false);
    act(() => result.current.goToPreviousWeek());
    // 再描画せずに今日が翌週になる（currentWeekStart は古いまま）
    mockToday.mockReturnValue("2026-11-09");
    act(() => result.current.goToNextWeek());
    rerender({ week: "2026-11-09", isLocked: false });
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });
});
