import type { Routine } from "@/types/routine";
import type { HistoryMap, WeeklyGoalProgress } from "./types";
import {
  countCompletionDays,
  indexCompletionDays,
} from "./weeklyGoalCompletions";
import { resolveDefinitionsForWeek } from "./weeklyGoalDefinitions";
import { buildWeekStartKeys, getWeekStartKey } from "./weeklyGoalDateKeys";
import { calculateStreaks } from "./weeklyGoalStreaks";

export type CalculateWeeklyGoalProgressParams = {
  selectedDate: Date;
  today: Date;
  routines: Routine[];
  history: HistoryMap;
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
  const routinesById = new Map(
    routines.map((routine) => [routine.id, routine]),
  );
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
    const firstWeekStartKey = getWeekStartKey(new Date(weeklyGoal.startedAt));
    const streakEndKey =
      selectedWeekStartKey <= todayWeekStartKey
        ? selectedWeekStartKey
        : todayWeekStartKey;
    const achievedByWeek =
      firstWeekStartKey <= streakEndKey
        ? buildWeekStartKeys(firstWeekStartKey, streakEndKey).map(
            (weekStartKey) =>
              countCompletionDays(completionDaysByGoal, goalId, weekStartKey) >=
              weeklyGoal.targetPerWeek,
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
      remainingCount: Math.max(0, weeklyGoal.targetPerWeek - completedCount),
      isAchieved: completedCount >= weeklyGoal.targetPerWeek,
      ...streaks,
    };
  });
};
