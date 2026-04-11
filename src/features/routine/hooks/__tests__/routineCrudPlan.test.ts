import type { Routine } from "@/types/routine";
import { createRoutineSubmitPlan } from "../routineCrudPlan";

describe("createRoutineSubmitPlan", () => {
  const editingRoutine: Routine = {
    id: "r1",
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1, 3],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
  };

  it("新規作成時はadd-newを返す", () => {
    expect(createRoutineSubmitPlan(undefined)).toEqual({
      type: "add-new",
    });
  });

  it("単体編集時はupdate-singleを返す", () => {
    expect(createRoutineSubmitPlan(editingRoutine)).toEqual({
      type: "update-single",
      routineId: "r1",
    });
  });
});
