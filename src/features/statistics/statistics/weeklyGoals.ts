import { toJstDateKey } from "@/lib/storage/core";
import type {
  DailyHistory,
  Routine,
  WeeklyGoal,
} from "@/types/routine";
import type { HistoryMap, WeeklyGoalProgress } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

type RoutineSnapshot = DailyHistory["routineSnapshots"][number];
type HistoryEntry = [dateKey: string, entry: DailyHistory];
type CompletionDaysByGoal = Map<string, Map<string, Set<string>>>;

type GoalDefinition = {
  goalId: string;
  title: string;
  weeklyGoal: WeeklyGoal;
};

export type CalculateWeeklyGoalProgressParams = {
  selectedDate: Date;
  today: Date;
  routines: Routine[];
  history: HistoryMap;
};

const addDaysToDateKey = (dateKey: string, days: number): string => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
};

const getWeekStartKeyFromDateKey = (dateKey: string): string => {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return addDaysToDateKey(dateKey, -((day + 6) % 7));
};

const getWeekStartKey = (date: Date): string =>
  getWeekStartKeyFromDateKey(toJstDateKey(date));

const getGoalId = (item: Pick<Routine, "id" | "groupId">): string =>
  item.groupId ?? item.id;

const isValidWeeklyGoal = (value: unknown): value is WeeklyGoal => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<WeeklyGoal>;
  return (
    Number.isInteger(candidate.targetPerWeek) &&
    Number(candidate.targetPerWeek) >= 1 &&
    Number(candidate.targetPerWeek) <= 7 &&
    typeof candidate.startedAt === "string" &&
    Number.isFinite(Date.parse(candidate.startedAt))
  );
};

const toGoalDefinition = (
  item: Pick<Routine, "id" | "groupId" | "title" | "weeklyGoal">,
): GoalDefinition | null => {
  if (!isValidWeeklyGoal(item.weeklyGoal)) return null;

  return {
    goalId: getGoalId(item),
    title: item.title,
    weeklyGoal: item.weeklyGoal,
  };
};

const collectSnapshotDefinitions = (
  weekStartKey: string,
  historyEntries: HistoryEntry[],
): Map<string, GoalDefinition> => {
  const definitions = new Map<string, GoalDefinition>();
  const weekEndKey = addDaysToDateKey(weekStartKey, 6);

  historyEntries
    .filter(
      ([dateKey]) => dateKey >= weekStartKey && dateKey <= weekEndKey,
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([, entry]) => {
      entry.routineSnapshots.forEach((snapshot) => {
        const definition = toGoalDefinition(snapshot);
        if (definition) definitions.set(definition.goalId, definition);
      });
    });

  return definitions;
};

const collectCurrentDefinitions = (
  weekStartKey: string,
  routines: Routine[],
): Map<string, GoalDefinition> => {
  const definitions = new Map<string, GoalDefinition>();

  routines.forEach((routine) => {
    const definition = toGoalDefinition(routine);
    if (!definition) return;

    const startedWeek = getWeekStartKey(new Date(definition.weeklyGoal.startedAt));
    if (startedWeek <= weekStartKey) {
      definitions.set(definition.goalId, definition);
    }
  });

  return definitions;
};

const resolveDefinitionsForWeek = (
  selectedWeekStartKey: string,
  todayWeekStartKey: string,
  routines: Routine[],
  historyEntries: HistoryEntry[],
): GoalDefinition[] => {
  const currentDefinitions = collectCurrentDefinitions(
    selectedWeekStartKey,
    routines,
  );
  const snapshotDefinitions = collectSnapshotDefinitions(
    selectedWeekStartKey,
    historyEntries,
  );

  // 現在週は現在も存在する目標だけを表示する。削除・解除済みの目標が
  // 今週前半のsnapshotに残っていても、現在の一覧へ復活させない。
  // 過去週は当時の状態を再現するためsnapshotを優先する。
  const definitions =
    selectedWeekStartKey === todayWeekStartKey
      ? currentDefinitions
      : new Map([...currentDefinitions, ...snapshotDefinitions]);

  return [...definitions.values()].sort(
    (left, right) =>
      left.title.localeCompare(right.title, "ja") ||
      left.goalId.localeCompare(right.goalId),
  );
};

const resolveCompletedGoalId = (
  completedRoutineId: string,
  snapshots: RoutineSnapshot[],
  routinesById: Map<string, Routine>,
): string | null => {
  const snapshot = snapshots.find(({ id }) => id === completedRoutineId);
  if (snapshot?.groupId) return snapshot.groupId;

  const currentRoutine = routinesById.get(completedRoutineId);
  if (currentRoutine) return getGoalId(currentRoutine);

  return snapshot?.id ?? null;
};

const indexCompletionDays = (
  historyEntries: HistoryEntry[],
  routinesById: Map<string, Routine>,
): CompletionDaysByGoal => {
  const completionDaysByGoal: CompletionDaysByGoal = new Map();

  historyEntries.forEach(([dateKey, entry]) => {
    const weekStartKey = getWeekStartKeyFromDateKey(dateKey);

    entry.completedRoutineIds.forEach((routineId) => {
      const goalId = resolveCompletedGoalId(
        routineId,
        entry.routineSnapshots,
        routinesById,
      );
      if (!goalId) return;

      const completionDaysByWeek =
        completionDaysByGoal.get(goalId) ?? new Map<string, Set<string>>();
      const completedDates =
        completionDaysByWeek.get(weekStartKey) ?? new Set<string>();
      completedDates.add(dateKey);
      completionDaysByWeek.set(weekStartKey, completedDates);
      completionDaysByGoal.set(goalId, completionDaysByWeek);
    });
  });

  return completionDaysByGoal;
};

const countCompletionDays = (
  completionDaysByGoal: CompletionDaysByGoal,
  goalId: string,
  weekStartKey: string,
): number =>
  completionDaysByGoal.get(goalId)?.get(weekStartKey)?.size ?? 0;

const buildWeekStartKeys = (
  firstWeekStartKey: string,
  lastWeekStartKey: string,
): string[] => {
  const keys: string[] = [];

  for (
    let weekStartKey = firstWeekStartKey;
    weekStartKey <= lastWeekStartKey;
    weekStartKey = addDaysToDateKey(weekStartKey, 7)
  ) {
    keys.push(weekStartKey);
  }

  return keys;
};

const calculateStreaks = (
  achievedByWeek: boolean[],
  lastWeekIsCurrent: boolean,
): Pick<WeeklyGoalProgress, "currentStreak" | "longestStreak"> => {
  let longestStreak = 0;
  let running = 0;

  achievedByWeek.forEach((achieved) => {
    running = achieved ? running + 1 : 0;
    longestStreak = Math.max(longestStreak, running);
  });

  const currentSlice =
    lastWeekIsCurrent && achievedByWeek.at(-1) === false
      ? achievedByWeek.slice(0, -1)
      : achievedByWeek;
  let currentStreak = 0;

  for (let index = currentSlice.length - 1; index >= 0; index -= 1) {
    if (!currentSlice[index]) break;
    currentStreak += 1;
  }

  return { currentStreak, longestStreak };
};

export const calculateWeeklyGoalProgress = ({
  selectedDate,
  today,
  routines,
  history,
}: CalculateWeeklyGoalProgressParams): WeeklyGoalProgress[] => {
  const selectedWeekStartKey = getWeekStartKey(selectedDate);
  const todayWeekStartKey = getWeekStartKey(today);
  const historyEntries = Object.entries(history);
  const routinesById = new Map(routines.map((routine) => [routine.id, routine]));
  const completionDaysByGoal = indexCompletionDays(
    historyEntries,
    routinesById,
  );
  const definitions = resolveDefinitionsForWeek(
    selectedWeekStartKey,
    todayWeekStartKey,
    routines,
    historyEntries,
  );

  return definitions.map(({ goalId, title, weeklyGoal }) => {
    const completedCount = countCompletionDays(
      completionDaysByGoal,
      goalId,
      selectedWeekStartKey,
    );
    const firstWeekStartKey = getWeekStartKey(
      new Date(weeklyGoal.startedAt),
    );
    const streakEndKey =
      selectedWeekStartKey <= todayWeekStartKey
        ? selectedWeekStartKey
        : todayWeekStartKey;
    const achievedByWeek =
      firstWeekStartKey <= streakEndKey
        ? buildWeekStartKeys(firstWeekStartKey, streakEndKey).map(
            (weekStartKey) =>
              countCompletionDays(
                completionDaysByGoal,
                goalId,
                weekStartKey,
              ) >= weeklyGoal.targetPerWeek,
          )
        : [];
    const streaks = calculateStreaks(
      achievedByWeek,
      streakEndKey === todayWeekStartKey,
    );

    return {
      goalId,
      title,
      targetPerWeek: weeklyGoal.targetPerWeek,
      completedCount,
      remainingCount: Math.max(
        0,
        weeklyGoal.targetPerWeek - completedCount,
      ),
      isAchieved: completedCount >= weeklyGoal.targetPerWeek,
      ...streaks,
    };
  });
};
