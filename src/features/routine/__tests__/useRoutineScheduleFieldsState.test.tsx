import { act, renderHook } from "@testing-library/react";
import { useRoutineScheduleFieldsState } from "../components/useRoutineScheduleFieldsState";

describe("useRoutineScheduleFieldsState", () => {
  it("days/startTime/duration を管理する", () => {
    const { result } = renderHook(() =>
      useRoutineScheduleFieldsState({
        initialDaysOfWeek: [1, 2],
        initialStartTime: "07:00",
        initialDuration: "30",
      }),
    );

    act(() => {
      result.current.setDaysOfWeek([3, 4]);
      result.current.setStartTime("08:00");
      result.current.setDuration("45");
    });

    expect(result.current.daysOfWeek).toEqual([3, 4]);
    expect(result.current.startTime).toBe("08:00");
    expect(result.current.duration).toBe("45");
  });
});
