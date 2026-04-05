import { renderHook } from "@testing-library/react";

jest.mock("../useRoutineVisibilitySync", () => ({
  useRoutineVisibilitySync: jest.fn(),
}));

jest.mock("../useRoutinePageShowSync", () => ({
  useRoutinePageShowSync: jest.fn(),
}));

jest.mock("../useRoutineFocusSync", () => ({
  useRoutineFocusSync: jest.fn(),
}));

jest.mock("../useRoutineSavedSync", () => ({
  useRoutineSavedSync: jest.fn(),
}));

import { useRoutineFocusSync } from "../useRoutineFocusSync";
import { useRoutinePageShowSync } from "../useRoutinePageShowSync";
import { useRoutineSavedSync } from "../useRoutineSavedSync";
import { useRoutineStateSync } from "../useRoutineStateSync";
import { useRoutineVisibilitySync } from "../useRoutineVisibilitySync";

describe("useRoutineStateSync", () => {
  it("各 lifecycle sync hook を compose する", () => {
    const setRoutines = jest.fn();

    renderHook(() => useRoutineStateSync(true, setRoutines));

    expect(useRoutineVisibilitySync).toHaveBeenCalledWith(true, setRoutines);
    expect(useRoutinePageShowSync).toHaveBeenCalledWith(true, setRoutines);
    expect(useRoutineFocusSync).toHaveBeenCalledWith(true, setRoutines);
    expect(useRoutineSavedSync).toHaveBeenCalledWith(true, setRoutines);
  });
});
