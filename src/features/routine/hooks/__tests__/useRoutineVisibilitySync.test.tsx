import { act, renderHook } from "@testing-library/react";

jest.mock("../routineStateSync", () => ({
  refreshRoutineState: jest.fn(),
  shouldRefreshOnVisibilityChange: jest.fn(),
}));

import {
  refreshRoutineState,
  shouldRefreshOnVisibilityChange,
} from "../routineStateSync";
import { useRoutineVisibilitySync } from "../useRoutineVisibilitySync";

describe("useRoutineVisibilitySync", () => {
  it("visible 判定のときだけ refresh する", () => {
    const setRoutines = jest.fn();
    let visibilityState: DocumentVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
    (shouldRefreshOnVisibilityChange as jest.Mock).mockReturnValue(true);

    const { unmount } = renderHook(() =>
      useRoutineVisibilitySync(true, setRoutines),
    );

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(shouldRefreshOnVisibilityChange).toHaveBeenCalledWith("visible");
    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);

    (shouldRefreshOnVisibilityChange as jest.Mock).mockReturnValue(false);
    visibilityState = "hidden";

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(shouldRefreshOnVisibilityChange).toHaveBeenCalledWith("hidden");
    expect(refreshRoutineState).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("未ロードなら listener を登録しない", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    renderHook(() => useRoutineVisibilitySync(false, jest.fn()));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
  });
});
