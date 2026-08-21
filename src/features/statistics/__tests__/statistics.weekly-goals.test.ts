import type {
  DailyHistory,
  MonthlyHistory,
  Routine,
  WeeklyGoal,
} from "@/types/routine";
import { calculateWeeklyGoalProgress } from "../statistics/weeklyGoals";

const goal = (
  targetPerWeek: number,
  startedAt = "2026-08-03T00:00:00+09:00",
): WeeklyGoal => ({ targetPerWeek, startedAt });

const routine = (
  id: string,
  weeklyGoal: WeeklyGoal = goal(2),
): Routine => ({
  id,
  groupId: "exercise",
  weeklyGoal,
  title: "運動",
  startTime: "07:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-08-03T00:00:00+09:00",
  updatedAt: "2026-08-03T00:00:00+09:00",
});

const routines = [routine("exercise-mon"), routine("exercise-wed")];

const historyEntry = (
  date: string,
  completedRoutineIds: string[],
  options: {
    sourceRoutines?: Routine[];
    includeGoal?: boolean;
  } = {},
): DailyHistory => {
  const sourceRoutines = options.sourceRoutines ?? routines;
  const includeGoal = options.includeGoal ?? true;

  return {
    date,
    completedRoutineIds,
    routineSnapshots: sourceRoutines.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      startTime: item.startTime,
      groupId: item.groupId,
      ...(includeGoal && item.weeklyGoal
        ? { weeklyGoal: { ...item.weeklyGoal } }
        : {}),
    })),
  };
};

const history = (...entries: DailyHistory[]): MonthlyHistory =>
  Object.fromEntries(entries.map((entry) => [entry.date, entry]));

describe("calculateWeeklyGoalProgress", () => {
  it("異なる3日で完了すると週3回の目標を達成する", () => {
    const threeDayGoal = goal(3, "2026-08-17T00:00:00+09:00");
    const threeDayRoutines = [
      routine("exercise-mon", threeDayGoal),
      routine("exercise-wed", threeDayGoal),
      routine("exercise-fri", threeDayGoal),
    ];

    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-19T03:00:00+09:00"),
      today: new Date("2026-08-19T03:00:00+09:00"),
      routines: threeDayRoutines,
      history: history(
        historyEntry("2026-08-17", ["exercise-mon"], {
          sourceRoutines: threeDayRoutines,
        }),
        historyEntry("2026-08-18", ["exercise-wed"], {
          sourceRoutines: threeDayRoutines,
        }),
        historyEntry("2026-08-19", ["exercise-fri"], {
          sourceRoutines: threeDayRoutines,
        }),
      ),
    });

    expect(result).toEqual([
      expect.objectContaining({
        goalId: "exercise",
        title: "運動",
        targetPerWeek: 3,
        completedCount: 3,
        remainingCount: 0,
        isAchieved: true,
        currentStreak: 1,
        longestStreak: 1,
      }),
    ]);
  });

  it("同じ日の同一グループ完了は1回だけ数える", () => {
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-19T12:00:00+09:00"),
      today: new Date("2026-08-19T12:00:00+09:00"),
      routines,
      history: history(
        historyEntry("2026-08-18", ["exercise-mon", "exercise-wed"]),
      ),
    });

    expect(result[0]).toMatchObject({
      completedCount: 1,
      remainingCount: 1,
      isAchieved: false,
    });
  });

  it("進行中の未達週は直前までのストリークを切断しない", () => {
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-19T12:00:00+09:00"),
      today: new Date("2026-08-19T12:00:00+09:00"),
      routines,
      history: history(
        historyEntry("2026-08-03", ["exercise-mon"]),
        historyEntry("2026-08-05", ["exercise-wed"]),
        historyEntry("2026-08-10", ["exercise-mon"]),
        historyEntry("2026-08-12", ["exercise-wed"]),
        historyEntry("2026-08-17", ["exercise-mon"]),
      ),
    });

    expect(result[0]).toMatchObject({
      completedCount: 1,
      currentStreak: 2,
      longestStreak: 2,
    });
  });

  it("終了済みの未達週で現在ストリークを終了する", () => {
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-17T12:00:00+09:00"),
      today: new Date("2026-08-24T12:00:00+09:00"),
      routines,
      history: history(
        historyEntry("2026-08-03", ["exercise-mon"]),
        historyEntry("2026-08-05", ["exercise-wed"]),
        historyEntry("2026-08-10", ["exercise-mon"]),
        historyEntry("2026-08-17", ["exercise-mon"]),
        historyEntry("2026-08-19", ["exercise-wed"]),
      ),
    });

    expect(result[0]).toMatchObject({ currentStreak: 1, longestStreak: 1 });
  });

  it("最長ストリークは未達週をまたがず最大の連続達成週数を返す", () => {
    const weekly = goal(1);
    const oneDayRoutines = [routine("exercise-mon", weekly)];
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-31T12:00:00+09:00"),
      today: new Date("2026-08-31T12:00:00+09:00"),
      routines: oneDayRoutines,
      history: history(
        historyEntry("2026-08-03", ["exercise-mon"], {
          sourceRoutines: oneDayRoutines,
        }),
        historyEntry("2026-08-10", ["exercise-mon"], {
          sourceRoutines: oneDayRoutines,
        }),
        historyEntry("2026-08-24", ["exercise-mon"], {
          sourceRoutines: oneDayRoutines,
        }),
        historyEntry("2026-08-31", ["exercise-mon"], {
          sourceRoutines: oneDayRoutines,
        }),
      ),
    });

    expect(result[0]).toMatchObject({ currentStreak: 2, longestStreak: 2 });
  });

  it("目標変更後は新しい開始週より前の達成を数えない", () => {
    const changedGoal = goal(1, "2026-08-17T12:00:00+09:00");
    const changedRoutines = [routine("exercise-mon", changedGoal)];
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-17T12:00:00+09:00"),
      today: new Date("2026-08-17T12:00:00+09:00"),
      routines: changedRoutines,
      history: history(
        historyEntry("2026-08-03", ["exercise-mon"]),
        historyEntry("2026-08-10", ["exercise-mon"]),
        historyEntry("2026-08-17", ["exercise-mon"], {
          sourceRoutines: changedRoutines,
        }),
      ),
    });

    expect(result[0]).toMatchObject({ currentStreak: 1, longestStreak: 1 });
  });

  it("日曜日を当週、翌月曜日を次週として扱う", () => {
    const sundayGoal = goal(2, "2026-08-17T00:00:00+09:00");
    const sundayRoutines = [routine("exercise-mon", sundayGoal)];
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-23T12:00:00+09:00"),
      today: new Date("2026-08-23T12:00:00+09:00"),
      routines: sundayRoutines,
      history: history(
        historyEntry("2026-08-23", ["exercise-mon"], {
          sourceRoutines: sundayRoutines,
        }),
        historyEntry("2026-08-24", ["exercise-mon"], {
          sourceRoutines: sundayRoutines,
        }),
      ),
    });

    expect(result[0]?.completedCount).toBe(1);
  });

  it("JSTで日付が変わった直後もJST日付キーの週へ集計する", () => {
    const jstGoal = goal(1, "2026-08-16T15:00:00Z");
    const jstRoutines = [routine("exercise-mon", jstGoal)];
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-16T15:30:00Z"),
      today: new Date("2026-08-16T15:30:00Z"),
      routines: jstRoutines,
      history: history(
        historyEntry("2026-08-17", ["exercise-mon"], {
          sourceRoutines: jstRoutines,
        }),
      ),
    });

    expect(result[0]).toMatchObject({ completedCount: 1, isAchieved: true });
  });

  it("削除済みルーティンを過去のsnapshotから集計する", () => {
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-03T12:00:00+09:00"),
      today: new Date("2026-08-24T12:00:00+09:00"),
      routines: [],
      history: history(
        historyEntry("2026-08-03", ["exercise-mon"]),
        historyEntry("2026-08-05", ["exercise-wed"]),
      ),
    });

    expect(result[0]).toMatchObject({
      goalId: "exercise",
      completedCount: 2,
      isAchieved: true,
    });
  });

  it("削除済みルーティンは現在週のsnapshotに残っていても表示しない", () => {
    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-19T12:00:00+09:00"),
      today: new Date("2026-08-19T12:00:00+09:00"),
      routines: [],
      history: history(
        historyEntry("2026-08-17", ["exercise-mon"]),
        historyEntry("2026-08-19", ["exercise-wed"]),
      ),
    });

    expect(result).toEqual([]);
  });

  it("壊れた週間目標は無視する", () => {
    const invalidRoutine = routine("invalid", {
      targetPerWeek: 0,
      startedAt: "invalid-date",
    });

    const result = calculateWeeklyGoalProgress({
      selectedDate: new Date("2026-08-17T12:00:00+09:00"),
      today: new Date("2026-08-17T12:00:00+09:00"),
      routines: [invalidRoutine],
      history: history(
        historyEntry("2026-08-17", ["invalid"], {
          sourceRoutines: [invalidRoutine],
        }),
      ),
    });

    expect(result).toEqual([]);
  });
});
