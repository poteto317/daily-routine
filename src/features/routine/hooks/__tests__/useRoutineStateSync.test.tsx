import { renderHook } from "@testing-library/react";

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

    renderHook(() => useRoutineStateSync(true, setRoutines));

    expect(useRoutineForegroundSync).toHaveBeenCalledWith(true, setRoutines);
    expect(useRoutineSavedSync).toHaveBeenCalledWith(true, setRoutines);
  });
});
