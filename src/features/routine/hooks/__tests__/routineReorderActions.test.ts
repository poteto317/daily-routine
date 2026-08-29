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
    const updated = reorderRoutineState(
      routines,
      [routines[1], routines[0]],
      routines,
    );

    expect(updated).toEqual([
      { ...routines[1], sortOrder: 0 },
      { ...routines[0], sortOrder: 1 },
    ]);
  });

  it("並び替え対象に不明なIDが含まれる場合は拒否する", () => {
    const unknownRoutine = { ...routines[0], id: "unknown" };

    const reorderedRoutines = [unknownRoutine, routines[0]];
    const updated = reorderRoutineState(
      routines,
      reorderedRoutines,
      reorderedRoutines,
    );

    expect(updated).toBeNull();
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
      routines,
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

  it("カテゴリ絞り込みで非表示の同曜日ルーティンと重なる並び替えは保存しない", () => {
    const visibleFirst: Routine = {
      ...routines[0],
      id: "visible-first",
      startTime: "19:00",
      duration: 30,
      category: "health",
      sortOrder: 0,
    };
    const hidden: Routine = {
      ...routines[1],
      id: "hidden",
      startTime: "19:30",
      duration: 20,
      category: "work",
      isCompleted: false,
      sortOrder: 1,
    };
    const visibleLast: Routine = {
      ...routines[0],
      id: "visible-last",
      startTime: "19:50",
      duration: 20,
      category: "health",
      sortOrder: 2,
    };
    const currentRoutines = [visibleFirst, hidden, visibleLast];
    const sourceRoutines = [visibleFirst, visibleLast];
    const overlappingReorder = [
      { ...visibleLast, startTime: "19:00" },
      { ...visibleFirst, startTime: "19:20" },
    ];

    const updated = reorderRoutineState(
      currentRoutines,
      overlappingReorder,
      sourceRoutines,
    );

    expect(updated).toBeNull();
  });
});
