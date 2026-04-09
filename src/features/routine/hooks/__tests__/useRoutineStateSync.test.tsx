import { renderHook } from "@testing-library/react";
import type { Routine } from "@/types/routine";

jest.mock("../useRoutineForegroundSync", () => ({
  useRoutineForegroundSync: jest.fn(),
}));

jest.mock("../useRoutineSavedSync", () => ({
  useRoutineSavedSync: jest.fn(),
}));

import { useRoutineForegroundSync } from "../useRoutineForegroundSync";
import { useRoutineSavedSync } from "../useRoutineSavedSync";
import { useRoutineStateSync } from "../useRoutineStateSync";

describe("useRoutineStateSync", () => {
  it("各 lifecycle sync hook を compose する", () => {
    const setRoutines = jest.fn();
    const routines: Routine[] = [];

    renderHook(() => useRoutineStateSync(true, setRoutines, routines, 1800000));

    expect(useRoutineForegroundSync).toHaveBeenCalledWith(
      true,
      setRoutines,
      routines,
      1800000,
    );
    expect(useRoutineSavedSync).toHaveBeenCalledWith(true, setRoutines);
  });
});
