import type { Routine } from "@/types/routine";
import {
  getDailyProgress,
  getRoutines,
  saveDailyProgress,
  saveDailyProgressSilently,
  saveRoutines,
} from "@/features/routine/storage";
import { getTodayString } from "@/lib/storage/core";
import {
  initializeRoutineState,
  resetRoutinesWhenDateChanged,
} from "../routineLifecycleState";

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(() => []),
  saveRoutines: jest.fn(),
  getDailyProgress: jest.fn(() => null),
  saveDailyProgress: jest.fn(),
  saveDailyProgressSilently: jest.fn(),
}));

jest.mock("@/lib/storage/core", () => ({
  getTodayString: jest.fn(() => "2026-02-13"),
}));

describe("routineLifecycleState", () => {
  const baseRoutine: Routine = {
    id: "r1",
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getRoutines as jest.Mock).mockReturnValue([]);
    (getDailyProgress as jest.Mock).mockReturnValue(null);
    (getTodayString as jest.Mock).mockReturnValue("2026-02-13");
  });

  it("initializeRoutineStateは当日進捗がなければ完了状態をリセットする", () => {
    (getRoutines as jest.Mock).mockReturnValue([
      { ...baseRoutine, isCompleted: true },
    ]);

    const state = initializeRoutineState();

    expect(state[0]?.isCompleted).toBe(false);
    expect(saveDailyProgressSilently).toHaveBeenCalledWith(
      expect.objectContaining({
        date: "2026-02-13",
        completedRoutineIds: [],
      }),
    );
    expect(saveDailyProgress).not.toHaveBeenCalled();
  });

  it("initializeRoutineStateは当日進捗を完了状態に反映する", () => {
    (getRoutines as jest.Mock).mockReturnValue([baseRoutine]);
    (getDailyProgress as jest.Mock).mockReturnValue({
      date: "2026-02-13",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-02-13T00:00:00.000Z",
    });

    const state = initializeRoutineState();
    expect(state[0]?.isCompleted).toBe(true);
  });

  it("initializeRoutineStateは複数曜日ルーティンを移行して保存する", () => {
    (getRoutines as jest.Mock).mockReturnValue([
      { ...baseRoutine, id: "multi", daysOfWeek: [1, 3], isCompleted: true },
    ]);

    initializeRoutineState();
    expect(saveRoutines).toHaveBeenCalled();
  });

  it("resetRoutinesWhenDateChangedは日付が同じならnullを返す", () => {
    (getDailyProgress as jest.Mock).mockReturnValue({
      date: "2026-02-13",
      completedRoutineIds: [],
      lastResetTime: "2026-02-13T00:00:00.000Z",
    });

    const result = resetRoutinesWhenDateChanged([{ ...baseRoutine }]);

    expect(result).toBeNull();
    expect(saveDailyProgress).not.toHaveBeenCalled();
    expect(saveDailyProgressSilently).not.toHaveBeenCalled();
    expect(saveRoutines).not.toHaveBeenCalled();
  });

  it("resetRoutinesWhenDateChangedは日付変更時に進捗と状態をリセットする", () => {
    (getDailyProgress as jest.Mock).mockReturnValue({
      date: "2026-02-12",
      completedRoutineIds: ["r1"],
      lastResetTime: "2026-02-12T00:00:00.000Z",
    });

    const result = resetRoutinesWhenDateChanged([
      { ...baseRoutine, isCompleted: true },
    ]);

    expect(result).toEqual([{ ...baseRoutine, isCompleted: false }]);
    expect(saveDailyProgressSilently).toHaveBeenCalled();
    expect(saveDailyProgress).not.toHaveBeenCalled();
    expect(saveRoutines).toHaveBeenCalledWith([
      expect.objectContaining({ id: "r1", isCompleted: false }),
    ]);
  });
});
