import { renderHook, act } from "@testing-library/react";
import type { Routine } from "@/types/routine";

jest.mock("../routineLifecycleState", () => ({
  initializeRoutineState: jest.fn(),
}));

jest.mock("../routinePersistenceSync", () => ({
  saveAndSyncRoutines: jest.fn(),
  updateNotificationSchedules: jest.fn(),
}));

jest.mock("../useRoutineStateSync", () => ({
  useRoutineStateSync: jest.fn(),
}));

jest.mock("../useRoutineMutations", () => ({
  useRoutineMutations: jest.fn(),
}));

jest.mock("../useRoutineQueries", () => ({
  useRoutineQueries: jest.fn(),
}));

jest.mock("../useRoutinesResult", () => ({
  createUseRoutinesResult: jest.fn(),
}));

jest.mock("@/features/settings/storage", () => ({
  DEFAULT_SETTINGS: { backgroundRefreshIntervalMinutes: 30 },
  getSettings: jest.fn(() => ({ backgroundRefreshIntervalMinutes: 30 })),
  SETTINGS_UPDATED_EVENT: "settings-updated",
}));

import { initializeRoutineState } from "../routineLifecycleState";
import {
  saveAndSyncRoutines,
  updateNotificationSchedules,
} from "../routinePersistenceSync";
import { createUseRoutinesResult } from "../useRoutinesResult";
import { useRoutineMutations } from "../useRoutineMutations";
import { useRoutineQueries } from "../useRoutineQueries";
import { useRoutineStateSync } from "../useRoutineStateSync";
import { getSettings } from "@/features/settings/storage";
import { useRoutines } from "../useRoutines";

const mockRoutines: Routine[] = [
  {
    id: "1",
    title: "Morning",
    startTime: "09:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    description: "",
    notificationMinutes: 10,
    sortOrder: 0,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

describe("useRoutines", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (initializeRoutineState as jest.Mock).mockReturnValue(mockRoutines);
    (useRoutineMutations as jest.Mock).mockReturnValue({
      addRoutine: jest.fn(),
      addRoutines: jest.fn(),
      updateRoutine: jest.fn(),
      deleteRoutine: jest.fn(),
      deleteRoutineGroup: jest.fn(),
      replaceRoutinesForDays: jest.fn(),
      toggleComplete: jest.fn(),
      reorderRoutines: jest.fn(),
    });
    (useRoutineQueries as jest.Mock).mockReturnValue({
      getTodayRoutines: jest.fn(),
      getRoutinesByDayOfWeek: jest.fn(),
      getHolidayRoutines: jest.fn(),
      getIsTodayHoliday: jest.fn(),
    });
    (createUseRoutinesResult as jest.Mock).mockImplementation(
      ({ isLoaded, mutations, queries, routines, schedules }) => ({
        routines,
        isLoaded,
        ...mutations,
        ...queries,
        ...schedules,
      }),
    );
    (updateNotificationSchedules as jest.Mock).mockResolvedValue("scheduled");
  });

  it("state sync, mutations, queries, result builder を compose する", () => {
    const { result } = renderHook(() => useRoutines());

    expect(useRoutineStateSync).toHaveBeenCalledWith(
      true,
      expect.any(Function),
      mockRoutines,
      1800000,
    );
    expect(useRoutineMutations).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
    expect(useRoutineQueries).toHaveBeenCalledWith(mockRoutines);
    expect(createUseRoutinesResult).toHaveBeenCalledWith({
      isLoaded: true,
      mutations: (useRoutineMutations as jest.Mock).mock.results[0].value,
      queries: (useRoutineQueries as jest.Mock).mock.results[0].value,
      routines: mockRoutines,
      schedules: {
        updateServiceWorkerSchedules: expect.any(Function),
      },
    });
    expect(result.current.routines).toEqual(mockRoutines);
  });

  it("schedule updater は引数なしなら current routines を使う", async () => {
    const { result } = renderHook(() => useRoutines());

    await act(async () => {
      await result.current.updateServiceWorkerSchedules();
    });

    expect(updateNotificationSchedules).toHaveBeenCalledWith(mockRoutines);
  });

  it("schedule updater は明示引数を優先する", async () => {
    const scheduledRoutines: Routine[] = [
      {
        ...mockRoutines[0],
        id: "2",
        title: "Evening",
      },
    ];
    const { result } = renderHook(() => useRoutines());

    await act(async () => {
      await result.current.updateServiceWorkerSchedules(scheduledRoutines);
    });

    expect(updateNotificationSchedules).toHaveBeenCalledWith(scheduledRoutines);
  });

  it("mutations に渡す saveAndSync は persistence helper を呼ぶ", () => {
    renderHook(() => useRoutines());

    const saveAndSync = (useRoutineMutations as jest.Mock).mock.calls[0][1] as (
      updated: Routine[],
    ) => void;

    saveAndSync(mockRoutines);

    expect(saveAndSyncRoutines).toHaveBeenCalledWith(
      mockRoutines,
      process.env.NEXT_PUBLIC_FUNCTIONS_URL,
    );
  });

  it("SETTINGS_UPDATED_EVENT 発火後に backgroundRefreshIntervalMs が更新される", () => {
    renderHook(() => useRoutines());

    // 初期ロード時のコールを確認
    expect(useRoutineStateSync).toHaveBeenLastCalledWith(
      true,
      expect.any(Function),
      mockRoutines,
      1800000, // 30分 × 60 × 1000
    );

    // 設定が 15分 に変更されたとシミュレート
    (getSettings as jest.Mock).mockReturnValue({
      backgroundRefreshIntervalMinutes: 15,
    });
    act(() => {
      window.dispatchEvent(new Event("settings-updated"));
    });

    expect(useRoutineStateSync).toHaveBeenLastCalledWith(
      true,
      expect.any(Function),
      mockRoutines,
      900000, // 15分 × 60 × 1000
    );
  });

  it("backgroundRefreshIntervalMinutes が NaN 相当の値のときデフォルト値にフォールバックする", () => {
    (getSettings as jest.Mock).mockReturnValue({
      backgroundRefreshIntervalMinutes: "broken",
    });

    renderHook(() => useRoutines());

    // DEFAULT_SETTINGS.backgroundRefreshIntervalMinutes = 30 → 1800000ms
    expect(useRoutineStateSync).toHaveBeenCalledWith(
      true,
      expect.any(Function),
      mockRoutines,
      1800000,
    );
  });

  it("backgroundRefreshIntervalMinutes が範囲上限（60分）を超えるときクランプされる", () => {
    (getSettings as jest.Mock).mockReturnValue({
      backgroundRefreshIntervalMinutes: 999,
    });

    renderHook(() => useRoutines());

    expect(useRoutineStateSync).toHaveBeenCalledWith(
      true,
      expect.any(Function),
      mockRoutines,
      3600000, // 60分 × 60 × 1000（上限）
    );
  });
});
