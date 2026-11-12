import { act, renderHook } from "@testing-library/react";

jest.mock("../routineStateSync", () => ({
  refreshRoutineState: jest.fn(),
}));

// useRoutineLastUpdateTracker は useRef(0) + useEffect で lastUpdateAt を管理する。
// ここでは ref を直接制御できるようモックして、スキップ判定のテストを分離する。
const mockLastUpdateRef = { current: 0 };
jest.mock("../useRoutineLastUpdateTracker", () => ({
  useRoutineLastUpdateTracker: jest.fn(() => mockLastUpdateRef),
}));

// useRoutineFallbackTimer は start/stop を返す。
// compose ロジック（何の引数で start が呼ばれるか等）を検証するためモックする。
const mockStart = jest.fn();
const mockStop = jest.fn();
jest.mock("../useRoutineFallbackTimer", () => ({
  useRoutineFallbackTimer: jest.fn(() => ({
    start: mockStart,
    stop: mockStop,
  })),
}));

// 現在時刻の通知は、呼ばれた回数だけを検証する（購読しているコンポーネントはここには無い）
jest.mock("@/hooks/useCurrentMinute", () => ({
  notifyCurrentMinute: jest.fn(),
}));

import { notifyCurrentMinute } from "@/hooks/useCurrentMinute";
import { refreshRoutineState } from "../routineStateSync";
import { useRoutineForegroundSync } from "../useRoutineForegroundSync";

const FALLBACK_INTERVAL_MS = 30 * 60 * 1000;

// start() の呼び出しを実際に実行させるヘルパー
// モック内で onTick コールバックを受け取り、setInterval でそのまま実行する
// 戻り値の ID を afterEach で clearInterval するために保持する
let activeIntervalId: ReturnType<typeof setInterval> | null = null;
const activateRealTimer = () => {
  (mockStart as jest.Mock).mockImplementation((onTick: () => void) => {
    activeIntervalId = setInterval(onTick, FALLBACK_INTERVAL_MS);
  });
};

describe("useRoutineForegroundSync", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    activeIntervalId = null;
    (refreshRoutineState as jest.Mock).mockClear();
    (notifyCurrentMinute as jest.Mock).mockClear();
    mockStart.mockReset();
    mockStop.mockReset();
    mockLastUpdateRef.current = 0;
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  afterEach(() => {
    if (activeIntervalId !== null) {
      clearInterval(activeIntervalId);
      activeIntervalId = null;
    }
    jest.useRealTimers();
  });

  // ── イベント購読 ─────────────────────────────────────────────

  it("visibilitychange(visible) で refreshRoutineState をスケジュールする", () => {
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      jest.advanceTimersByTime(0);
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("pageshow で refreshRoutineState をスケジュールする", () => {
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      window.dispatchEvent(new Event("pageshow"));
      jest.advanceTimersByTime(0);
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("focus で refreshRoutineState をスケジュールする", () => {
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      window.dispatchEvent(new Event("focus"));
      jest.advanceTimersByTime(0);
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  // ── coalesce（同一 tick の重複排除）─────────────────────────

  it("同一 tick で複数イベントが発火しても refresh は 1 回だけ呼ばれる", () => {
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("pageshow"));
      window.dispatchEvent(new Event("focus"));
      jest.advanceTimersByTime(0);
    });

    expect(refreshRoutineState).toHaveBeenCalledTimes(1);
  });

  // ── hidden 時のキャンセル ────────────────────────────────────

  it("スケジュール登録後に hidden になると refresh しない", () => {
    const setRoutines = jest.fn();
    let visibilityState: DocumentVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });

    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      visibilityState = "hidden";
      jest.advanceTimersByTime(0);
    });

    expect(refreshRoutineState).not.toHaveBeenCalled();
  });

  it("visibilitychange(hidden) で stopFallbackTimer を呼ぶ", () => {
    let visibilityState: DocumentVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });

    renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );
    mockStop.mockClear();

    act(() => {
      visibilityState = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(mockStop).toHaveBeenCalled();
  });

  // ── フォールバックタイマーの compose ─────────────────────────

  it("マウント時に startFallbackTimer を呼ぶ", () => {
    renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );

    expect(mockStart).toHaveBeenCalledWith(expect.any(Function));
  });

  it("visibilitychange(visible) 後に startFallbackTimer を呼ぶ", () => {
    renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );
    mockStart.mockClear();

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(mockStart).toHaveBeenCalledWith(expect.any(Function));
  });

  it("pageshow 後に startFallbackTimer を呼ぶ", () => {
    renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );
    mockStart.mockClear();

    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(mockStart).toHaveBeenCalledWith(expect.any(Function));
  });

  it("focus 後に startFallbackTimer を呼ぶ", () => {
    renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );
    mockStart.mockClear();

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(mockStart).toHaveBeenCalledWith(expect.any(Function));
  });

  // ── フォールバック tick のスキップ判定 ───────────────────────

  it("フォールバック tick: visible かつ十分に時間が経過していれば refresh する", () => {
    const setRoutines = jest.fn();
    activateRealTimer();

    mockLastUpdateRef.current = 0; // 遠い過去
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      jest.setSystemTime(FALLBACK_INTERVAL_MS + 1);
      jest.advanceTimersByTime(FALLBACK_INTERVAL_MS);
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("フォールバック tick: 直近でルーティン更新があればスキップする", () => {
    const setRoutines = jest.fn();
    activateRealTimer();

    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    // 間隔の直前にルーティン更新があった状況をシミュレート
    act(() => {
      jest.advanceTimersByTime(FALLBACK_INTERVAL_MS - 60_000);
    });
    mockLastUpdateRef.current = Date.now(); // 直近更新

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(refreshRoutineState).not.toHaveBeenCalled();
  });

  // ── 現在時刻の通知 ───────────────────────────────────────────

  it("同一 tick の複数の復帰イベントをまとめた後に、現在時刻を 1 回だけ通知する", () => {
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("pageshow"));
      window.dispatchEvent(new Event("focus"));
      // まとめる前（タイマーが発火する前）には通知しない
      expect(notifyCurrentMinute).not.toHaveBeenCalled();
      jest.advanceTimersByTime(0);
    });

    expect(notifyCurrentMinute).toHaveBeenCalledTimes(1);
  });

  it("スケジュール登録後に hidden になると、現在時刻を通知しない", () => {
    let visibilityState: DocumentVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      visibilityState = "hidden";
      jest.advanceTimersByTime(0);
    });

    expect(notifyCurrentMinute).not.toHaveBeenCalled();
  });

  it("フォールバック tick: スキップ条件が成り立っても現在時刻は通知し、refreshRoutineState は呼ばない", () => {
    activateRealTimer();
    const setRoutines = jest.fn();
    renderHook(() =>
      useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      jest.advanceTimersByTime(FALLBACK_INTERVAL_MS - 60_000);
    });
    // 直近でルーティンが更新された（refreshRoutineState はスキップされる条件）
    mockLastUpdateRef.current = Date.now();
    expect(notifyCurrentMinute).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(notifyCurrentMinute).toHaveBeenCalledTimes(1);
    expect(refreshRoutineState).not.toHaveBeenCalled();
  });

  // ── isLoaded フラグ ──────────────────────────────────────────

  it("isLoaded=false のとき listener を登録しない", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const docAddSpy = jest.spyOn(document, "addEventListener");

    renderHook(() =>
      useRoutineForegroundSync(false, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );

    expect(addSpy).not.toHaveBeenCalledWith("pageshow", expect.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith("focus", expect.any(Function));
    expect(docAddSpy).not.toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );

    addSpy.mockRestore();
    docAddSpy.mockRestore();
  });

  // ── クリーンアップ ───────────────────────────────────────────

  it("アンマウント時に listener を解除する", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const docRemoveSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );
    unmount();

    expect(removeSpy).toHaveBeenCalledWith("pageshow", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(docRemoveSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );

    removeSpy.mockRestore();
    docRemoveSpy.mockRestore();
  });

  it("アンマウント時にペンディング中の setTimeout をキャンセルする", () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");

    const { unmount } = renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("アンマウント時に stopFallbackTimer を呼ぶ", () => {
    const { unmount } = renderHook(() =>
      useRoutineForegroundSync(true, jest.fn(), [], FALLBACK_INTERVAL_MS),
    );
    mockStop.mockClear();

    unmount();

    expect(mockStop).toHaveBeenCalled();
  });
});
