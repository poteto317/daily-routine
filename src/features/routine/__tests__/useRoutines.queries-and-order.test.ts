import "./useRoutines.test.setup";
import { renderHook, act } from "@testing-library/react";
import { useRoutines } from "../hooks/useRoutines";
import {
  filterRoutinesByDayOfWeek,
  getRoutines,
  mockRoutine,
  saveRoutines,
  setupUseRoutinesDefaults,
} from "./useRoutines.test.setup";

describe("useRoutines queries and ordering", () => {
  beforeEach(setupUseRoutinesDefaults);

  it("getTodayRoutines/getRoutinesByDayOfWeek/getHolidayRoutinesが機能する", () => {
    const holidayRoutines = [
      { ...mockRoutine, id: "1", daysOfWeek: [7] },
      { ...mockRoutine, id: "2", daysOfWeek: [7] },
      { ...mockRoutine, id: "3", daysOfWeek: [1] },
    ];
    (getRoutines as jest.Mock).mockReturnValue(holidayRoutines);
    (filterRoutinesByDayOfWeek as jest.Mock).mockReturnValue([
      holidayRoutines[2],
    ]);

    const { result } = renderHook(() => useRoutines());
    expect(result.current.getTodayRoutines()).toHaveLength(3);
    expect(result.current.getRoutinesByDayOfWeek(1)).toHaveLength(1);
    expect(result.current.getHolidayRoutines()).toHaveLength(2);
  });

  it("reorderRoutinesで並び順を更新して保存する", () => {
    const routines = [
      { ...mockRoutine, id: "1", sortOrder: 0 },
      { ...mockRoutine, id: "2", sortOrder: 1 },
      { ...mockRoutine, id: "3", sortOrder: 2 },
    ];
    (getRoutines as jest.Mock).mockReturnValue(routines);
    const { result } = renderHook(() => useRoutines());

    act(() => {
      result.current.reorderRoutines([routines[2], routines[0], routines[1]]);
    });

    expect(result.current.routines[0].id).toBe("3");
    expect(saveRoutines).toHaveBeenCalled();
  });
});
