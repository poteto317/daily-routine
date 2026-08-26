import type { Routine } from "@/types/routine";
import { reorderRoutineState } from "../routineReorderActions";

describe("routineReorderActions", () => {
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
      sortOrder: 2,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "2",
      title: "Read",
      startTime: "21:00",
      duration: 20,
      category: "study",
      daysOfWeek: [1],
      isCompleted: true,
      description: "",
      notificationMinutes: 0,
      sortOrder: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  it("並び替え後に sortOrder を振り直す", () => {
    const updated = reorderRoutineState(routines, [routines[1], routines[0]]);

    expect(updated).toEqual([
      { ...routines[1], sortOrder: 0 },
      { ...routines[0], sortOrder: 1 },
    ]);
  });

  it("並び替え対象に不明なIDが含まれる場合は既存データを保持する", () => {
    const unknownRoutine = { ...routines[0], id: "unknown" };

    const updated = reorderRoutineState(routines, [
      unknownRoutine,
      routines[0],
    ]);

    expect(updated).toEqual(routines);
  });

  it("古い並び替え入力でも最新のルーティン情報を保持する", () => {
    const currentRoutines: Routine[] = [
      {
        ...routines[0],
        title: "Updated Morning Run",
        isCompleted: true,
        weeklyGoal: {
          targetPerWeek: 5,
          startedAt: "2026-08-26",
        },
        updatedAt: "2026-08-26",
      },
      {
        ...routines[1],
        title: "Updated Read",
        updatedAt: "2026-08-26",
      },
    ];
    const staleReorderedRoutines: Routine[] = [
      {
        ...routines[1],
        startTime: currentRoutines[0].startTime,
      },
      {
        ...routines[0],
        startTime: currentRoutines[1].startTime,
      },
    ];

    const updated = reorderRoutineState(
      currentRoutines,
      staleReorderedRoutines,
    );

    expect(updated).toEqual([
      {
        ...currentRoutines[1],
        startTime: "07:00",
        sortOrder: 0,
      },
      {
        ...currentRoutines[0],
        startTime: "21:00",
        sortOrder: 1,
      },
    ]);
  });

  it("並び替え入力の時刻が最新stateと異なる場合は最新stateを保持する", () => {
    const currentRoutines: Routine[] = [
      { ...routines[0], startTime: "08:00", updatedAt: "2026-08-26" },
      routines[1],
    ];
    const staleReorderedRoutines: Routine[] = [
      { ...routines[1], startTime: "07:00" },
      { ...routines[0], startTime: "21:00" },
    ];

    const updated = reorderRoutineState(
      currentRoutines,
      staleReorderedRoutines,
    );

    expect(updated).toEqual(currentRoutines);
  });
});
