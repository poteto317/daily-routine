import type { Routine } from "@/types/routine";

jest.mock("../routineLifecycleState", () => ({
  initializeRoutineState: jest.fn(() => []),
  resetRoutinesWhenDateChanged: jest.fn(() => null),
}));

import {
  initializeRoutineState,
  resetRoutinesWhenDateChanged,
} from "../routineLifecycleState";
import {
  refreshRoutineState,
  reloadRoutinesFromStorage,
  shouldRefreshOnPageShow,
  shouldRefreshOnVisibilityChange,
} from "../routineStateSync";

describe("routineStateSync", () => {
  const previousRoutines: Routine[] = [
    {
      id: "1",
      title: "Morning Run",
      startTime: "07:00",
      duration: 30,
      category: "health",
      daysOfWeek: [1],
      isCompleted: true,
      description: "",
      notificationMinutes: 10,
      sortOrder: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("可視状態が visible のときだけ再評価する", () => {
    expect(shouldRefreshOnVisibilityChange("visible")).toBe(true);
    expect(shouldRefreshOnVisibilityChange("hidden")).toBe(false);
  });

  it("pageshow は bfcache 復元または visible で再評価する", () => {
    expect(shouldRefreshOnPageShow(true, "hidden")).toBe(true);
    expect(shouldRefreshOnPageShow(false, "visible")).toBe(true);
    expect(shouldRefreshOnPageShow(false, "hidden")).toBe(false);
  });

  it("日付変更時はリセット済みルーティンに置き換える", () => {
    const updatedRoutines = [{ ...previousRoutines[0], isCompleted: false }];
    const setRoutines = jest.fn();
    (resetRoutinesWhenDateChanged as jest.Mock).mockReturnValue(updatedRoutines);

    refreshRoutineState(setRoutines);

    const updater = setRoutines.mock.calls[0][0] as (
      routines: Routine[],
    ) => Routine[];
    expect(updater(previousRoutines)).toEqual(updatedRoutines);
    expect(resetRoutinesWhenDateChanged).toHaveBeenCalledWith(previousRoutines);
  });

  it("日付変更がない場合も新しい配列参照を返す", () => {
    const setRoutines = jest.fn();
    (resetRoutinesWhenDateChanged as jest.Mock).mockReturnValue(null);

    refreshRoutineState(setRoutines);

    const updater = setRoutines.mock.calls[0][0] as (
      routines: Routine[],
    ) => Routine[];
    const nextRoutines = updater(previousRoutines);

    expect(nextRoutines).toEqual(previousRoutines);
    expect(nextRoutines).not.toBe(previousRoutines);
  });

  it("保存イベント時は遅延して localStorage から再読込する", () => {
    const setRoutines = jest.fn();
    const scheduleTask = jest.fn((callback: () => void) => {
      callback();
      return 0;
    });
    const loadedRoutines = [{ ...previousRoutines[0], id: "reloaded" }];
    (initializeRoutineState as jest.Mock).mockReturnValue(loadedRoutines);

    reloadRoutinesFromStorage(setRoutines, scheduleTask);

    expect(scheduleTask).toHaveBeenCalledWith(expect.any(Function), 0);
    expect(initializeRoutineState).toHaveBeenCalled();
    expect(setRoutines).toHaveBeenCalledWith(loadedRoutines);
  });
});
