import { renderHook } from "@testing-library/react";

jest.mock("../components/useRoutineFormSourceData", () => ({
  useRoutineFormSourceData: jest.fn(),
}));

jest.mock("../components/useRoutineFormDerivedContext", () => ({
  useRoutineFormDerivedContext: jest.fn(),
}));

import { useRoutineFormContextData } from "../components/useRoutineFormContextData";
import { useRoutineFormDerivedContext } from "../components/useRoutineFormDerivedContext";
import { useRoutineFormSourceData } from "../components/useRoutineFormSourceData";

describe("useRoutineFormContextData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRoutineFormSourceData as jest.Mock).mockReturnValue({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 10,
      existingRoutines: [{ id: "r1" }],
    });
    (useRoutineFormDerivedContext as jest.Mock).mockReturnValue({
      groupDaysOfWeek: [1, 2],
      initialState: { title: "朝活" },
    });
  });

  it("source data hook と derived context hook を compose する", () => {
    const routine = { id: "routine-1" } as never;
    const { result } = renderHook(() =>
      useRoutineFormContextData({
        currentDayOfWeek: 4,
        routine,
      }),
    );

    expect(useRoutineFormSourceData).toHaveBeenCalled();
    expect(useRoutineFormDerivedContext).toHaveBeenCalledWith({
      currentDayOfWeek: 4,
      defaultDurationMinutes: 30,
      existingRoutines: [{ id: "r1" }],
      routine,
    });
    expect(result.current).toEqual({
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 10,
      existingRoutines: [{ id: "r1" }],
      groupDaysOfWeek: [1, 2],
      initialState: { title: "朝活" },
    });
  });
});
