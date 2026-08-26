import type { Routine } from "@/types/routine";
import { toggleRoutineCompletionInState } from "../routineCompletionState";

describe("routineCompletionState", () => {
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
});
