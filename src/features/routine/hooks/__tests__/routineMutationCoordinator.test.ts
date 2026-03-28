import type { Routine } from "@/types/routine";
import {
  applyRoutineMutationAndSync,
  createRoutineMutationRunner,
} from "../routineMutationCoordinator";

describe("routineMutationCoordinator", () => {
  const routines: Routine[] = [
    {
      id: "1",
      title: "Morning Run",
      startTime: "07:00",
      duration: 30,
      category: "health",
      daysOfWeek: [1],
      isCompleted: false,
      description: "",
      notificationMinutes: 10,
      sortOrder: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  it("mutation結果を同期して返す", () => {
    const updated = [{ ...routines[0], title: "Updated" }];
    const mutate = jest.fn(() => updated);
    const saveAndSync = jest.fn();

    const result = applyRoutineMutationAndSync(routines, mutate, saveAndSync);

    expect(mutate).toHaveBeenCalledWith(routines);
    expect(saveAndSync).toHaveBeenCalledWith(updated);
    expect(result).toBe(updated);
  });

  it("setState updater 経由で mutation と同期を実行する", () => {
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const updated = [{ ...routines[0], title: "Runner Updated" }];
    const mutate = jest.fn(() => updated);

    createRoutineMutationRunner(setRoutines, saveAndSync)(mutate);

    const updater = setRoutines.mock.calls[0][0] as (
      previous: Routine[],
    ) => Routine[];
    expect(updater(routines)).toBe(updated);
    expect(saveAndSync).toHaveBeenCalledWith(updated);
  });
});
