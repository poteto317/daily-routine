import { act, renderHook } from "@testing-library/react";

jest.mock("../routineStateSync", () => ({
  refreshRoutineState: jest.fn(),
}));

import { refreshRoutineState } from "../routineStateSync";
import { useRoutineFocusSync } from "../useRoutineFocusSync";

describe("useRoutineFocusSync", () => {
  it("focus イベントで refresh する", () => {
    const setRoutines = jest.fn();

    renderHook(() => useRoutineFocusSync(true, setRoutines));

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(refreshRoutineState).toHaveBeenCalledWith(setRoutines);
  });

  it("未ロードなら listener を登録しない", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");

    renderHook(() => useRoutineFocusSync(false, jest.fn()));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "focus",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
  });

  it("アンマウント時に listener を解除する", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useRoutineFocusSync(true, jest.fn()),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "focus",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
