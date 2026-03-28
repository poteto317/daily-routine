import { renderHook } from "@testing-library/react";

jest.mock("../components/routineFormModel", () => ({
  getGroupDaysOfWeek: jest.fn(),
  getGroupRoutines: jest.fn(),
  resolveRoutineFormInitialState: jest.fn(),
}));

import {
  getGroupDaysOfWeek,
  getGroupRoutines,
  resolveRoutineFormInitialState,
} from "../components/routineFormModel";
import { useRoutineFormDerivedContext } from "../components/useRoutineFormDerivedContext";

describe("useRoutineFormDerivedContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resolveRoutineFormInitialState as jest.Mock).mockReturnValue({
      title: "朝活",
    });
    (getGroupRoutines as jest.Mock).mockReturnValue([{ id: "g1" }]);
    (getGroupDaysOfWeek as jest.Mock).mockReturnValue([1, 3, 5]);
  });

  it("initialState と groupDaysOfWeek を既存 routines から導出する", () => {
    const routine = { id: "r1" } as never;
    const existingRoutines = [{ id: "r1" }, { id: "r2" }] as never;

    const { result } = renderHook(() =>
      useRoutineFormDerivedContext({
        currentDayOfWeek: 2,
        defaultDurationMinutes: 45,
        existingRoutines,
        routine,
      }),
    );

    expect(resolveRoutineFormInitialState).toHaveBeenCalledWith({
      routine,
      currentDayOfWeek: 2,
      existingRoutines,
      defaultDurationMinutes: 45,
    });
    expect(getGroupRoutines).toHaveBeenCalledWith(existingRoutines, routine);
    expect(getGroupDaysOfWeek).toHaveBeenCalledWith([{ id: "g1" }]);
    expect(result.current).toEqual({
      groupDaysOfWeek: [1, 3, 5],
      initialState: {
        title: "朝活",
      },
    });
  });
});
