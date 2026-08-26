import { act, renderHook } from "@testing-library/react";
import type { Routine } from "@/types/routine";

jest.mock("@/lib/storage/core", () => ({
  getTodayString: jest.fn(() => "2026-03-16"),
}));

jest.mock("@/features/routine/storage", () => ({
  getDailyProgress: jest.fn(() => ({
    date: "2026-03-15",
    completedRoutineIds: [],
    lastResetTime: "2026-03-15T00:00:00.000Z",
  })),
  saveDailyProgress: jest.fn(),
}));

import { saveDailyProgress } from "@/features/routine/storage";
import { useRoutineCompletionToggleMutation } from "../useRoutineCompletionToggleMutation";

describe("useRoutineCompletionToggleMutation", () => {
  it("完了切替後に progress を保存する", () => {
    const previous: Routine[] = [
      {
        id: "r1",
        title: "Morning Run",
        startTime: "07:00",
        duration: 30,
        category: "health",
        daysOfWeek: [1],
        isCompleted: false,
        description: "",
        notificationMinutes: 10,
        sortOrder: 0,
        createdAt: "2026-03-15T00:00:00.000Z",
        updatedAt: "2026-03-15T00:00:00.000Z",
      },
    ];
    const setRoutines = jest.fn();
    const routinesRef = { current: previous };

    const { result } = renderHook(() =>
      useRoutineCompletionToggleMutation(setRoutines, routinesRef),
    );

    act(() => {
      result.current("r1");
    });

    const updated = [{ ...previous[0], isCompleted: true }];
    expect(routinesRef.current).toEqual(updated);
    expect(setRoutines).toHaveBeenCalledWith(routinesRef.current);
    expect(saveDailyProgress).toHaveBeenCalledWith({
      date: "2026-03-16",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-03-15T00:00:00.000Z",
    });
  });
});
