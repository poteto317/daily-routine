import type {
  CategoryStats,
  MonthlyStats,
  WeeklyStats,
} from "./statistics/types";
import textsJson from "./locales/ja.json";

type SummaryCard = {
  id: string;
  containerClassName: string;
  title: string;
  value: string;
  valueClassName: string;
};

const NO_DATA_LABEL = textsJson.summaryCards.noDataLabel;

const formatMonthlyDay = (
  day: MonthlyStats["bestDay"] | MonthlyStats["worstDay"],
): string => {
  if (!day) return NO_DATA_LABEL;

  return `${new Date(day.date).getDate()}日 (${day.achievementRate.toFixed(1)}%)`;
};

export const getWeeklySummaryCards = (
  weeklyStats: WeeklyStats,
): SummaryCard[] => [
  {
    id: "weekly-average",
    containerClassName: "bg-blue-50 dark:bg-blue-100 rounded-lg p-4",
    title: textsJson.summaryCards.weekly.averageTitle,
    value: `${weeklyStats.averageAchievementRate.toFixed(1)}%`,
    valueClassName: "text-3xl font-bold text-blue-600 dark:text-blue-700",
  },
  {
    id: "weekly-completed",
    containerClassName: "bg-green-50 dark:bg-green-100 rounded-lg p-4",
    title: textsJson.summaryCards.weekly.completedTitle,
    value: `${weeklyStats.totalCompleted}`,
    valueClassName: "text-3xl font-bold text-green-600 dark:text-green-700",
  },
  {
    id: "weekly-total",
    containerClassName: "bg-purple-50 dark:bg-purple-100 rounded-lg p-4",
    title: textsJson.summaryCards.weekly.totalTitle,
    value: `${weeklyStats.totalRoutines}`,
    valueClassName: "text-3xl font-bold text-purple-600 dark:text-purple-700",
  },
];

export const getMonthlySummaryCards = (
  monthlyStats: MonthlyStats,
): SummaryCard[] => [
  {
    id: "monthly-average",
    containerClassName: "bg-blue-50 dark:bg-blue-100 rounded-lg p-4",
    title: textsJson.summaryCards.monthly.averageTitle,
    value: `${monthlyStats.averageAchievementRate.toFixed(1)}%`,
    valueClassName: "text-3xl font-bold text-blue-600 dark:text-blue-700",
  },
  {
    id: "monthly-best",
    containerClassName: "bg-green-50 dark:bg-green-100 rounded-lg p-4",
    title: textsJson.summaryCards.monthly.bestDayTitle,
    value: formatMonthlyDay(monthlyStats.bestDay),
    valueClassName: "text-lg font-bold text-green-600 dark:text-green-700",
  },
  {
    id: "monthly-worst",
    containerClassName: "bg-orange-50 dark:bg-orange-100 rounded-lg p-4",
    title: textsJson.summaryCards.monthly.worstDayTitle,
    value: formatMonthlyDay(monthlyStats.worstDay),
    valueClassName: "text-lg font-bold text-orange-600 dark:text-orange-700",
  },
];

export const getCategorySummaryLabel = (year: number, month: number): string =>
  textsJson.summaryCards.category.summaryLabel
    .replace("{year}", String(year))
    .replace("{month}", String(month));

export const getCategoryCountLabel = (categoryStats: CategoryStats[]): string =>
  `${categoryStats.length} ${textsJson.summaryCards.category.countSuffix}`;
