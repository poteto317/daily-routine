import type { Routine } from "@/types/routine";
import type { RoutineData } from "../pages/types";
import {
  buildRoutineSubmitPayload,
  getGroupDaysOfWeek,
  getGroupRoutines,
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

  it("groupIdがある場合のみ同一グループを返す", () => {
    const routines: Routine[] = [
      baseRoutine,
      { ...baseRoutine, id: "r2", daysOfWeek: [3] },
      { ...baseRoutine, id: "r3", groupId: "g2", daysOfWeek: [5] },
    ];

    expect(
      getGroupRoutines(routines, baseRoutine).map((item) => item.id),
    ).toEqual(["r1", "r2"]);
  });

  it("groupDaysを昇順で返す", () => {
    const groupRoutines: Routine[] = [
      { ...baseRoutine, id: "r2", daysOfWeek: [3] },
      { ...baseRoutine, id: "r1", daysOfWeek: [1] },
    ];

    expect(getGroupDaysOfWeek(groupRoutines)).toEqual([1, 3]);
  });

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
    });
  });

  it("曜日トグルは追加/削除を行い昇順維持する", () => {
    expect(toggleDaySelection([1, 3], 2)).toEqual([1, 2, 3]);
    expect(toggleDaySelection([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("submit payloadを生成し編集時は元曜日を含める", () => {
    const state = {
      title: "更新朝活",
      category: "health" as const,
      daysOfWeek: [2, 4],
      startTime: "09:00",
      duration: "40",
      description: "desc",
      notificationMinutes: "15",
    };

    const { routineData, originalGroupDays } = buildRoutineSubmitPayload({
      routine: baseRoutine,
      state,
      defaultDurationMinutes: 30,
      groupDaysOfWeek: [1, 3],
    });

    const expected: RoutineData = {
      ...state,
      duration: 40,
      notificationMinutes: 15,
      isCompleted: false,
      sortOrder: 1,
      groupId: "g1",
    };

    expect(routineData).toEqual(expected);
    expect(originalGroupDays).toEqual([1, 3]);
  });

  it("数値パース失敗時はフォールバック値を使う", () => {
    expect(parseDurationOrDefault("abc", 30)).toBe(30);
    expect(parseNotificationMinutes("abc")).toBeUndefined();
    expect(parseNotificationMinutes("0")).toBeUndefined();
  });
});
