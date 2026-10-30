import type { Routine } from "@/types/routine";
import type { RoutineFormState } from "../routineFormInitialModel";
import {
  buildRoutineSubmitPayload,
  parseDurationOrDefault,
  parseNotificationMinutes,
} from "../routineFormSubmitModel";

const NOW = "2026-03-07T00:00:00.000Z";

const baseState: RoutineFormState = {
  title: "朝の散歩",
  category: "health",
  daysOfWeek: [1, 3],
  startTime: "07:00",
  duration: "30",
  description: "公園まで",
  notificationMinutes: "10",
  weeklyGoalTarget: "",
};

describe("parseDurationOrDefault", () => {
  it("正の整数はその値", () => {
    expect(parseDurationOrDefault("45", 20)).toBe(45);
  });

  it("空文字・数値でない・0・負数は既定値", () => {
    expect(parseDurationOrDefault("", 20)).toBe(20);
    expect(parseDurationOrDefault("abc", 20)).toBe(20);
    expect(parseDurationOrDefault("0", 20)).toBe(20);
    expect(parseDurationOrDefault("-5", 20)).toBe(20);
  });

  it("小数は整数部分を取る", () => {
    expect(parseDurationOrDefault("12.9", 20)).toBe(12);
  });
});

describe("parseNotificationMinutes", () => {
  it("空文字は undefined", () => {
    expect(parseNotificationMinutes("")).toBeUndefined();
  });

  it("正の整数はその値", () => {
    expect(parseNotificationMinutes("15")).toBe(15);
  });

  it("0・負数・数値でない値は undefined", () => {
    expect(parseNotificationMinutes("0")).toBeUndefined();
    expect(parseNotificationMinutes("-1")).toBeUndefined();
    expect(parseNotificationMinutes("abc")).toBeUndefined();
  });
});

describe("buildRoutineSubmitPayload", () => {
  it("新規作成は既定値で組み立てる", () => {
    const { routineData } = buildRoutineSubmitPayload({
      state: baseState,
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData).toEqual({
      title: "朝の散歩",
      category: "health",
      daysOfWeek: [1, 3],
      startTime: "07:00",
      duration: 30,
      description: "公園まで",
      notificationMinutes: 10,
      isCompleted: false,
      sortOrder: 0,
      groupId: undefined,
      weeklyGoal: undefined,
    });
  });

  it("説明が空なら undefined にし、所要時間が不正なら既定値を使う", () => {
    const { routineData } = buildRoutineSubmitPayload({
      state: {
        ...baseState,
        description: "",
        duration: "x",
        notificationMinutes: "",
      },
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.description).toBeUndefined();
    expect(routineData.duration).toBe(20);
    expect(routineData.notificationMinutes).toBeUndefined();
  });

  it("既存のルーティンの完了・並び順・グループを引き継ぐ", () => {
    const routine = {
      isCompleted: true,
      sortOrder: 4,
      groupId: "g1",
    } as Routine;

    const { routineData } = buildRoutineSubmitPayload({
      routine,
      state: baseState,
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.isCompleted).toBe(true);
    expect(routineData.sortOrder).toBe(4);
    expect(routineData.groupId).toBe("g1");
  });

  it("既存のルーティンの sortOrder が 0 でも 0 のまま", () => {
    const { routineData } = buildRoutineSubmitPayload({
      routine: { sortOrder: 0 } as Routine,
      state: baseState,
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.sortOrder).toBe(0);
  });

  it("週間目標は新規なら now を開始日時にする", () => {
    const { routineData } = buildRoutineSubmitPayload({
      state: { ...baseState, weeklyGoalTarget: "3" },
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.weeklyGoal).toEqual({
      targetPerWeek: 3,
      startedAt: NOW,
    });
  });

  it("週間目標が既存と同じ値なら既存を維持する", () => {
    const weeklyGoal = { targetPerWeek: 3, startedAt: "2026-01-01T00:00:00Z" };

    const { routineData } = buildRoutineSubmitPayload({
      routine: { weeklyGoal } as Routine,
      state: { ...baseState, weeklyGoalTarget: "3" },
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.weeklyGoal).toBe(weeklyGoal);
  });

  it("週間目標が空なら既存があっても外す", () => {
    const { routineData } = buildRoutineSubmitPayload({
      routine: {
        weeklyGoal: { targetPerWeek: 3, startedAt: "2026-01-01T00:00:00Z" },
      } as Routine,
      state: { ...baseState, weeklyGoalTarget: "" },
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.weeklyGoal).toBeUndefined();
  });

  it("週間目標が不正な入力なら既存を維持する", () => {
    const weeklyGoal = { targetPerWeek: 2, startedAt: "2026-01-01T00:00:00Z" };

    const { routineData } = buildRoutineSubmitPayload({
      routine: { weeklyGoal } as Routine,
      state: { ...baseState, weeklyGoalTarget: "9" },
      defaultDurationMinutes: 20,
      now: NOW,
    });

    expect(routineData.weeklyGoal).toBe(weeklyGoal);
  });

  it("now を省略したときは現在時刻を使う", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-05-01T00:00:00Z"));
    try {
      const { routineData } = buildRoutineSubmitPayload({
        state: { ...baseState, weeklyGoalTarget: "2" },
        defaultDurationMinutes: 20,
      });

      expect(routineData.weeklyGoal?.startedAt).toBe(
        "2026-05-01T00:00:00.000Z",
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
