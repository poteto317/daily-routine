import { type DailyHistory } from "@/types/routine";

export interface DailyStats {
  date: string;
  completedCount: number;
  totalCount: number;
  achievementRate: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  days: DailyStats[];
  averageAchievementRate: number;
  totalCompleted: number;
  totalRoutines: number;
}

export interface WeeklyGoalProgress {
  goalId: string;
  title: string;
  targetPerWeek: number;
  completedCount: number;
  remainingCount: number;
  isAchieved: boolean;
  currentStreak: number;
  longestStreak: number;
}

export interface MonthlyStats {
  year: number;
  month: number;
  days: DailyStats[];
  averageAchievementRate: number;
  totalCompleted: number;
  totalRoutines: number;
  bestDay: DailyStats | null;
  worstDay: DailyStats | null;
}

export interface CategoryStats {
  category: string;
  completed: number;
  total: number;
  achievementRate: number;
}

export type HistoryMap = Record<string, DailyHistory>;
