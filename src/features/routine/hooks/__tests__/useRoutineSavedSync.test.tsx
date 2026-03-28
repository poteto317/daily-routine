import { act, renderHook } from "@testing-library/react";

jest.mock("../routineStateSync", () => ({
  reloadRoutinesFromStorage: jest.fn(),
}));

import { ROUTINES_SAVED_EVENT } from "../routinePersistenceSync";
import { reloadRoutinesFromStorage } from "../routineStateSync";
import { useRoutineSavedSync } from "../useRoutineSavedSync";

describe("useRoutineSavedSync", () => {
  it("保存イベント時に storage から再読込する", () => {
    const setRoutines = jest.fn();
    const { unmount } = renderHook(() =>
      useRoutineSavedSync(true, setRoutines),
    );

    act(() => {
      window.dispatchEvent(new CustomEvent(ROUTINES_SAVED_EVENT));
    });

    expect(reloadRoutinesFromStorage).toHaveBeenCalledWith(setRoutines);

    unmount();

    act(() => {
      window.dispatchEvent(new CustomEvent(ROUTINES_SAVED_EVENT));
    });

    expect(reloadRoutinesFromStorage).toHaveBeenCalledTimes(1);
  });
});
