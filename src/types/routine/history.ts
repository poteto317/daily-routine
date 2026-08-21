import type { RoutineCategory } from "./categories";
import type { WeeklyGoal } from "./core";

export interface DailyProgress {
  date: string;
  completedRoutineIds: string[];
  lastResetTime: string;
}

export interface DailyHistory {
  date: string;
  completedRoutineIds: string[];
  routineSnapshots: {
    id: string;
    title: string;
    category: RoutineCategory;
    startTime: string;
    groupId?: string;
    weeklyGoal?: WeeklyGoal;
  }[];
}

export interface MonthlyHistory {
  [date: string]: DailyHistory;
}

export interface PomodoroSession {
  date: string;
  completedPomodoros: number;
}

export interface PomodoroHistory {
  [date: string]: PomodoroSession;
}
