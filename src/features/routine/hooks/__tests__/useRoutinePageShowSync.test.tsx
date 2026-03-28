import { act, renderHook } from "@testing-library/react";

jest.mock("../routineStateSync", () => ({
  refreshRoutineState: jest.fn(),
  shouldRefreshOnPageShow: jest.fn(),
}));

import {
  refreshRoutineState,
  shouldRefreshOnPageShow,
} from "../routineStateSync";
import { useRoutinePageShowSync } from "../useRoutinePageShowSync";

describe("useRoutinePageShowSync", () => {
  it("pageshow 条件を満たすと refresh する", () => {
    const setRoutines = jest.fn();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    (shouldRefreshOnPageShow as jest.Mock).mockReturnValue(true);

    renderHook(() => useRoutinePageShowSync(true, setRoutines));

    const event = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(event, "persisted", {
      configurable: true,
      value: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(shouldRefreshOnPageShow).toHaveBeenCalledWith(true, "visible");
    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("未ロードなら listener を登録しない", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");

    renderHook(() => useRoutinePageShowSync(false, jest.fn()));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "pageshow",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
  });
});
