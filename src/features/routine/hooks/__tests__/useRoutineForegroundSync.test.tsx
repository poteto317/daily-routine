import { act, renderHook } from "@testing-library/react";

jest.mock("../routineStateSync", () => ({
  refreshRoutineState: jest.fn(),
  shouldRefreshOnVisibilityChange: jest.fn(),
  shouldRefreshOnPageShow: jest.fn(),
}));

import {
  refreshRoutineState,
  shouldRefreshOnPageShow,
  shouldRefreshOnVisibilityChange,
} from "../routineStateSync";
import { useRoutineForegroundSync } from "../useRoutineForegroundSync";

describe("useRoutineForegroundSync", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (refreshRoutineState as jest.Mock).mockClear();
    (shouldRefreshOnVisibilityChange as jest.Mock).mockReturnValue(false);
    (shouldRefreshOnPageShow as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("visibilitychange が visible のとき refresh をスケジュールする", () => {
    const setRoutines = jest.fn();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    (shouldRefreshOnVisibilityChange as jest.Mock).mockReturnValue(true);

    renderHook(() => useRoutineForegroundSync(true, setRoutines));

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      jest.runAllTimers();
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("pageshow 条件を満たすとき refresh をスケジュールする", () => {
    const setRoutines = jest.fn();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    (shouldRefreshOnPageShow as jest.Mock).mockReturnValue(true);

    renderHook(() => useRoutineForegroundSync(true, setRoutines));

    const event = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(event, "persisted", {
      configurable: true,
      value: true,
    });

    act(() => {
      window.dispatchEvent(event);
      jest.runAllTimers();
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("focus イベントで refresh をスケジュールする", () => {
    const setRoutines = jest.fn();

    renderHook(() => useRoutineForegroundSync(true, setRoutines));

    act(() => {
      window.dispatchEvent(new Event("focus"));
      jest.runAllTimers();
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("タイマー実行前に hidden に戻った場合は refresh しない", () => {
    const setRoutines = jest.fn();
    let visibilityState: DocumentVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
    (shouldRefreshOnVisibilityChange as jest.Mock).mockReturnValue(true);

    renderHook(() => useRoutineForegroundSync(true, setRoutines));

    act(() => {
      // visible でスケジュール登録
      document.dispatchEvent(new Event("visibilitychange"));
      // タイマー実行前に hidden に遷移
      visibilityState = "hidden";
      jest.runAllTimers();
    });

    expect(refreshRoutineState).not.toHaveBeenCalled();
  });

  it("複数イベントが同一 tick で発火しても refresh は 1 回だけ呼ばれる", () => {
    const setRoutines = jest.fn();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    (shouldRefreshOnVisibilityChange as jest.Mock).mockReturnValue(true);
    (shouldRefreshOnPageShow as jest.Mock).mockReturnValue(true);

    renderHook(() => useRoutineForegroundSync(true, setRoutines));

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      const pageShowEvent = new Event("pageshow") as PageTransitionEvent;
      Object.defineProperty(pageShowEvent, "persisted", {
        configurable: true,
        value: true,
      });
      window.dispatchEvent(pageShowEvent);
      window.dispatchEvent(new Event("focus"));
      jest.runAllTimers();
    });

    expect(refreshRoutineState).toHaveBeenCalledTimes(1);
  });

  it("未ロードなら listener を登録しない", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const docAddSpy = jest.spyOn(document, "addEventListener");

    renderHook(() => useRoutineForegroundSync(false, jest.fn()));

    expect(addSpy).not.toHaveBeenCalledWith("pageshow", expect.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith("focus", expect.any(Function));
    expect(docAddSpy).not.toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );

    addSpy.mockRestore();
    docAddSpy.mockRestore();
  });

  it("アンマウント時に listener を解除する", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const docRemoveSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useRoutineForegroundSync(true, jest.fn()),
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

  it("アンマウント時にペンディング中のタイマーをキャンセルする", () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");

    const { unmount } = renderHook(() =>
      useRoutineForegroundSync(true, jest.fn()),
    );

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
