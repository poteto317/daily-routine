import textsJson from "./locales/ja.json";

export const STATISTICS_WEEKLY_GOALS_TEXT = {
  title: textsJson.weeklyGoals.title,
  empty: textsJson.weeklyGoals.empty,
  completed: textsJson.weeklyGoals.completed,
  remainingTemplate: textsJson.weeklyGoals.remainingTemplate,
  progressTemplate: textsJson.weeklyGoals.progressTemplate,
  currentStreakTemplate: textsJson.weeklyGoals.currentStreakTemplate,
  longestStreakTemplate: textsJson.weeklyGoals.longestStreakTemplate,
  progressAriaTemplate: textsJson.weeklyGoals.progressAriaTemplate,
} as const;
