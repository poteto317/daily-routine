import type { Routine } from "@/types/routine";
import type { RoutineData } from "../pages/types";
import {
  buildRoutineSubmitPayload,
  parseDurationOrDefault,
  parseNotificationMinutes,
  resolveRoutineFormInitialState,
  toggleDaySelection,
} from "../components/routineFormModel";

jest.mock("@/features/routine/storage", () => ({
  findNextAvailableTime: jest.fn(() => "09:30"),
}));

describe("routineFormModel", () => {
  const baseRoutine: Routine = {
    id: "r1",
    groupId: "g1",
    title: "朝活",
    startTime: "08:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-13T00:00:00.000Z",
  };

  it("初期状態を新規作成向けに解決する", () => {
    const state = resolveRoutineFormInitialState({
      existingRoutines: [],
      defaultDurationMinutes: 25,
      currentDayOfWeek: 2,
    });

    expect(state).toMatchObject({
      title: "",
      category: "hobby",
      daysOfWeek: [2],
      startTime: "09:30",
      duration: "25",
      description: "",
      notificationMinutes: "",
      weeklyGoalTarget: "",
    });
  });

  it("既存の週間目標を初期状態へ反映する", () => {
    const state = resolveRoutineFormInitialState({
      routine: {
        ...baseRoutine,
        weeklyGoal: {
          targetPerWeek: 3,
          startedAt: "2026-02-13T00:00:00.000Z",
        },
      },
      existingRoutines: [],
      defaultDurationMinutes: 30,
    });

    expect(state.weeklyGoalTarget).toBe("3");
  });

  it("週間目標の回数が欠損したデータでも初期状態を解決する", () => {
    const malformedRoutine = {
      ...baseRoutine,
      weeklyGoal: {
        startedAt: "2026-02-13T00:00:00.000Z",
      },
    } as unknown as Routine;

    expect(
      resolveRoutineFormInitialState({
        routine: malformedRoutine,
        existingRoutines: [],
        defaultDurationMinutes: 30,
      }).weeklyGoalTarget,
    ).toBe("");
  });

  it("groupDaysOfWeek が未指定の場合は routine.daysOfWeek を使う", () => {
    const state = resolveRoutineFormInitialState({
      routine: baseRoutine,
      existingRoutines: [],
      defaultDurationMinutes: 30,
    });

    expect(state.daysOfWeek).toEqual([1]);
  });

  it("曜日トグルは追加/削除を行い昇順維持する", () => {
    expect(toggleDaySelection([1, 3], 2)).toEqual([1, 2, 3]);
    expect(toggleDaySelection([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("submit payloadを生成する", () => {
    const state = {
      title: "更新朝活",
      category: "health" as const,
      daysOfWeek: [2, 4],
      startTime: "09:00",
      duration: "40",
      description: "desc",
      notificationMinutes: "15",
      weeklyGoalTarget: "3",
    };

    const { routineData } = buildRoutineSubmitPayload({
      routine: baseRoutine,
      state,
      defaultDurationMinutes: 30,
      now: "2026-08-22T00:00:00.000Z",
    });

    const expected: RoutineData = {
      title: "更新朝活",
      category: "health",
      daysOfWeek: [2, 4],
      startTime: "09:00",
      duration: 40,
      description: "desc",
      notificationMinutes: 15,
      isCompleted: false,
      sortOrder: 1,
      groupId: "g1",
      weeklyGoal: {
        targetPerWeek: 3,
        startedAt: "2026-08-22T00:00:00.000Z",
      },
    };

    expect(routineData).toEqual(expected);
  });

  it("数値パース失敗時はフォールバック値を使う", () => {
    expect(parseDurationOrDefault("abc", 30)).toBe(30);
    expect(parseNotificationMinutes("abc")).toBeUndefined();
    expect(parseNotificationMinutes("0")).toBeUndefined();
  });
});
