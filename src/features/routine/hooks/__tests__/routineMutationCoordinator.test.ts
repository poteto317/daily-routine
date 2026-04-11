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

  it("routinesRef.current の値で mutation を実行し setRoutines と saveAndSync を呼ぶ", () => {
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const routinesRef = { current: routines };
    const updated = [{ ...routines[0], title: "Runner Updated" }];
    const mutate = jest.fn(() => updated);

    createRoutineMutationRunner(setRoutines, saveAndSync, routinesRef)(mutate);

    expect(mutate).toHaveBeenCalledWith(routines);
    // setRoutines は直接値で呼ばれる（関数型 updater ではない）
    expect(setRoutines).toHaveBeenCalledWith(updated);
    // saveAndSync は setRoutines の外（render フェーズ外）で呼ばれる
    expect(saveAndSync).toHaveBeenCalledWith(updated);
  });

  it("runner 実行後に routinesRef.current が即座に updated に更新される", () => {
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const routinesRef = { current: routines };
    const updated = [{ ...routines[0], title: "After First Run" }];
    const updated2 = [{ ...routines[0], title: "After Second Run" }];

    createRoutineMutationRunner(setRoutines, saveAndSync, routinesRef)(() => updated);

    // 2 回目は routinesRef.current が updated になっていること（stale state にならない）
    const mutate2 = jest.fn(() => updated2);
    createRoutineMutationRunner(setRoutines, saveAndSync, routinesRef)(mutate2);

    expect(mutate2).toHaveBeenCalledWith(updated);
    expect(setRoutines).toHaveBeenLastCalledWith(updated2);
  });
});
