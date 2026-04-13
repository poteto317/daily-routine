import { act, renderHook } from "@testing-library/react";

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

jest.mock("../routineCompletionActions", () => ({
  buildDailyProgressForToggle: jest.fn(),
  toggleRoutineCompletionInState: jest.fn(),
}));

import { saveDailyProgress } from "@/features/routine/storage";
import {
  buildDailyProgressForToggle,
  toggleRoutineCompletionInState,
} from "../routineCompletionActions";
import { useRoutineCompletionToggleMutation } from "../useRoutineCompletionToggleMutation";

describe("useRoutineCompletionToggleMutation", () => {
  it("完了切替後に progress を保存する", () => {
    const previous = [{ id: "r1", isCompleted: false }];
    const updated = [{ id: "r1", isCompleted: true }];
    const progress = { date: "2026-03-16", completedRoutineIds: ["r1"] };
    const setRoutines = jest.fn();
    const routinesRef = {
      current: previous as unknown as import("@/types/routine").Routine[],
    };

    (toggleRoutineCompletionInState as jest.Mock).mockReturnValue(updated);
    (buildDailyProgressForToggle as jest.Mock).mockReturnValue(progress);

    const { result } = renderHook(() =>
      useRoutineCompletionToggleMutation(setRoutines, routinesRef),
    );

    act(() => {
      result.current("r1");
    });

    // setRoutines は関数型 updater ではなく直接値で呼ばれる
    expect(setRoutines).toHaveBeenCalledWith(updated);
    expect(toggleRoutineCompletionInState).toHaveBeenCalledWith(previous, "r1");
    // routinesRef.current が updated に更新されること
    expect(routinesRef.current).toBe(updated);
    expect(buildDailyProgressForToggle).toHaveBeenCalledWith(
      updated,
      "2026-03-16",
      expect.objectContaining({ date: "2026-03-15" }),
    );
    expect(saveDailyProgress).toHaveBeenCalledWith(progress);
  });
});
