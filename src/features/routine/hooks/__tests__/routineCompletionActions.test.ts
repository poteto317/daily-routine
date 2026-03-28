import type { Routine } from "@/types/routine";
import type { DailyProgressState } from "../routineStateProgressModel";
import {
  buildDailyProgressForToggle,
  reorderRoutineState,
  toggleRoutineCompletionInState,
} from "../routineCompletionActions";

describe("routineCompletionActions", () => {
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

  it("指定IDの完了状態だけを反転する", () => {
    const updated = toggleRoutineCompletionInState(routines, "1");

    expect(updated[0].isCompleted).toBe(true);
    expect(updated[1].isCompleted).toBe(true);
    expect(updated[1]).toEqual(routines[1]);
  });

  it("進捗データを完了済みIDから組み立てる", () => {
    const currentProgress: DailyProgressState = {
      date: "2024-01-14",
      completedRoutineIds: ["legacy"],
      lastResetTime: "2024-01-14T00:00:00.000Z",
    };

    const progress = buildDailyProgressForToggle(routines, "2024-01-15", currentProgress);

    expect(progress).toEqual({
      date: "2024-01-15",
      completedRoutineIds: ["2"],
      lastResetTime: "2024-01-14T00:00:00.000Z",
    });
  });

  it("並び替え後に sortOrder を振り直す", () => {
    const updated = reorderRoutineState([routines[1], routines[0]]);

    expect(updated).toEqual([
      { ...routines[1], sortOrder: 0 },
      { ...routines[0], sortOrder: 1 },
    ]);
  });
});
