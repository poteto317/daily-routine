import type { Routine } from "@/types/routine";
import type { RoutineData } from "../../pages/types";
import { createRoutineSubmitPlan } from "../routineCrudPlan";

describe("createRoutineSubmitPlan", () => {
  const routineData: RoutineData = {
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1, 3],
    isCompleted: false,
    sortOrder: 0,
  };

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
    expect(createRoutineSubmitPlan(undefined, routineData)).toEqual({
      type: "add-new",
    });
  });

  it("単体編集時はupdate-singleを返す", () => {
    expect(createRoutineSubmitPlan(editingRoutine, routineData)).toEqual({
      type: "update-single",
      routineId: "r1",
    });
  });

  it("グループ編集で曜日不変ならupdate-groupを返す", () => {
    expect(
      createRoutineSubmitPlan(
        { ...editingRoutine, groupId: "g1" },
        routineData,
        [1, 3],
      ),
    ).toEqual({
      type: "update-group",
      groupId: "g1",
    });
  });

  it("グループ編集で曜日変更時はreplace-groupを返す", () => {
    expect(
      createRoutineSubmitPlan(
        { ...editingRoutine, groupId: "g1" },
        { ...routineData, daysOfWeek: [2, 4] },
        [1, 3],
      ),
    ).toEqual({
      type: "replace-group",
      groupId: "g1",
    });
  });
});
