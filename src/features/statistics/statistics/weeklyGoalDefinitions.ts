import { isValidWeeklyGoal } from "@/lib/weeklyGoal";
import type { DailyHistory, Routine, WeeklyGoal } from "@/types/routine";
import { addDaysToDateKey, getWeekStartKey } from "./weeklyGoalDateKeys";

export type GoalDefinition = {
  goalId: string;
  title: string;
  weeklyGoal: WeeklyGoal;
};

export const getGoalId = (item: Pick<Routine, "id" | "groupId">): string =>
  item.groupId ?? item.id;

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
  historyEntries: Array<[string, DailyHistory]>,
): Map<string, GoalDefinition> => {
  const definitions = new Map<string, GoalDefinition>();
  const weekEndKey = addDaysToDateKey(weekStartKey, 6);

  historyEntries
    .filter(([dateKey]) => dateKey >= weekStartKey && dateKey <= weekEndKey)
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

    const startedWeek = getWeekStartKey(
      new Date(definition.weeklyGoal.startedAt),
    );
    if (startedWeek <= weekStartKey) {
      definitions.set(definition.goalId, definition);
    }
  });

  return definitions;
};

export const resolveDefinitionsForWeek = (
  selectedWeekStartKey: string,
  todayWeekStartKey: string,
  routines: Routine[],
  historyEntries: Array<[string, DailyHistory]>,
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
