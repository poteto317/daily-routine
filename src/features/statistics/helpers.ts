import type {
  CategoryStats,
  MonthlyStats,
  WeeklyStats,
} from "./statistics/types";
import type { ViewMode } from "./page/types";
import textsJson from "./locales/ja.json";

// ========================================
// Constants
// ========================================

export const STATISTICS_PAGE_TITLE = textsJson.page.title;
export const STATISTICS_PAGE_DESCRIPTION = textsJson.page.description;

export const STATISTICS_CHART_PANEL_TEXT = {
  noCategoryData: textsJson.chartPanel.noCategoryData,
} as const;

export const STATISTICS_CATEGORY_DETAIL_TEXT = {
  completedSuffix: textsJson.chartPanel.completedSuffix,
} as const;

export const STATISTICS_MODE_OPTIONS = textsJson.modeSelector.options.map(
  (option) => ({
    mode: option.mode as ViewMode,
    label: option.label,
  }),
);

export const STATISTICS_PERIOD_CONTROLS_TEXT = {
  currentWeek: textsJson.modeSelector.periodControls.currentWeek,
  currentMonth: textsJson.modeSelector.periodControls.currentMonth,
} as const;

const NO_DATA_LABEL = textsJson.summaryCards.noDataLabel;

// ========================================
// Types
// ========================================

type SummaryCard = {
  id: string;
  containerClassName: string;
  title: string;
  value: string;
  valueClassName: string;
};

// ========================================
// Statistics Page Functions
// ========================================

export const getStatisticsPeriodLabel = (params: {
  viewMode: ViewMode;
  weekStart: string;
  weekEnd: string;
  year: number;
  month: number;
}): string => {
  const { viewMode, weekStart, weekEnd, year, month } = params;

  return viewMode === "week"
    ? `${weekStart} 〜 ${weekEnd}`
    : `${year}年 ${month}月`;
};

// ========================================
// Summary Cards Functions
// ========================================

const formatMonthlyDay = (
  day: MonthlyStats["bestDay"] | MonthlyStats["worstDay"],
): string => {
  if (!day) return NO_DATA_LABEL;

  return `${new Date(day.date).getDate()}日 (${day.achievementRate.toFixed(1)}%)`;
};

export const getWeeklySummaryCards = (
  weeklyStats: WeeklyStats,
): SummaryCard[] => {
  return [
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
};

export const getMonthlySummaryCards = (
  monthlyStats: MonthlyStats,
): SummaryCard[] => {
  return [
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
};

export const getCategorySummaryLabel = (
  year: number,
  month: number,
): string => {
  return textsJson.summaryCards.category.summaryLabel
    .replace("{year}", String(year))
    .replace("{month}", String(month));
};

export const getCategoryCountLabel = (
  categoryStats: CategoryStats[],
): string => {
  return `${categoryStats.length} ${textsJson.summaryCards.category.countSuffix}`;
};

// ========================================
// Chart Panel Functions
// ========================================

export const formatCategoryCompletionLabel = (
  completed: number,
  total: number,
): string =>
  `${completed} / ${total} ${STATISTICS_CATEGORY_DETAIL_TEXT.completedSuffix}`;

// ========================================
// Mode Selector Functions
// ========================================

export const getCurrentPeriodLabel = (viewMode: ViewMode): string =>
  viewMode === "week"
    ? STATISTICS_PERIOD_CONTROLS_TEXT.currentWeek
    : STATISTICS_PERIOD_CONTROLS_TEXT.currentMonth;
