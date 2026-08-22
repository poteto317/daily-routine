import type { DailyHistory, Routine } from "@/types/routine";
import { getGoalId } from "./weeklyGoalDefinitions";
import { getWeekStartKeyFromDateKey } from "./weeklyGoalDateKeys";

type RoutineSnapshot = DailyHistory["routineSnapshots"][number];
type CompletionDaysByGoal = Map<string, Map<string, Set<string>>>;

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

export const indexCompletionDays = (
  historyEntries: Array<[string, DailyHistory]>,
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

export const countCompletionDays = (
  completionDaysByGoal: CompletionDaysByGoal,
  goalId: string,
  weekStartKey: string,
): number => completionDaysByGoal.get(goalId)?.get(weekStartKey)?.size ?? 0;
