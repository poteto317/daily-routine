import type { Routine } from "@/types/routine";
import { createRoutineMutationRunner } from "../routineMutationCoordinator";

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

  it("getRoutines() から取得した値で mutation を実行し setRoutines と saveAndSync を呼ぶ", () => {
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const getRoutines = jest.fn(() => routines);
    const updated = [{ ...routines[0], title: "Runner Updated" }];
    const mutate = jest.fn(() => updated);

    createRoutineMutationRunner(setRoutines, saveAndSync, getRoutines)(mutate);

    expect(getRoutines).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledWith(routines);
    // setRoutines は直接値で呼ばれる（関数型 updater ではない）
    expect(setRoutines).toHaveBeenCalledWith(updated);
    // saveAndSync は setRoutines の外（render フェーズ外）で呼ばれる
    expect(saveAndSync).toHaveBeenCalledWith(updated);
  });
});
