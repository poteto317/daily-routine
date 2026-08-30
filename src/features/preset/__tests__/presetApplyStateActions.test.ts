import type { Routine, RoutinePreset } from "@/types/routine";
import { replaceRoutinesForDaysInState } from "@/features/routine/hooks/routineCrudActions";
import { applyPresetSelection } from "../presetApplyWorkflow";
import { createRoutineFixture } from "./storageTestFixtures";

describe("applyPresetSelection", () => {
  it("空テンプレートのプリセットを適用しても対象曜日の既存ルーティンを削除しない", () => {
    const emptyPreset: RoutinePreset = {
      id: "empty-preset",
      name: "空プリセット",
      routineTemplates: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const originalRoutines = [createRoutineFixture({ daysOfWeek: [1] })];
    let currentRoutines: Routine[] = originalRoutines;

    const result = applyPresetSelection({
      presets: [emptyPreset],
      selectedPresetId: emptyPreset.id,
      selectedDays: new Set([1]),
      onApplyPreset: (routineInputs, targetDays) => {
        currentRoutines = replaceRoutinesForDaysInState(
          currentRoutines,
          targetDays,
          routineInputs,
        );
      },
    });

    expect(result.applied).toBe(false);
    expect(result.failureReason).toBe("empty-preset");
    expect(currentRoutines).toEqual(originalRoutines);
  });
});
