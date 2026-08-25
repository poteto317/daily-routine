import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatisticsSummaryCards } from "./StatisticsSummaryCards";
import type {
  CategoryStats,
  MonthlyStats,
  WeeklyStats,
} from "../../statistics/types";

const meta = {
  title: "Features/Statistics/StatisticsSummaryCards",
  component: StatisticsSummaryCards,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StatisticsSummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

const dailyBase = {
  date: "2026-05-21",
  completedCount: 0,
  totalCount: 0,
  achievementRate: 0,
};

const weeklyStats: WeeklyStats = {
  weekStart: "2026-05-18",
  weekEnd: "2026-05-24",
  days: [
    {
      ...dailyBase,
      date: "2026-05-18",
      completedCount: 4,
      totalCount: 5,
      achievementRate: 80,
    },
    {
      ...dailyBase,
      date: "2026-05-19",
      completedCount: 5,
      totalCount: 5,
      achievementRate: 100,
    },
    {
      ...dailyBase,
      date: "2026-05-20",
      completedCount: 3,
      totalCount: 5,
      achievementRate: 60,
    },
    {
      ...dailyBase,
      date: "2026-05-21",
      completedCount: 5,
      totalCount: 5,
      achievementRate: 100,
    },
    {
      ...dailyBase,
      date: "2026-05-22",
      completedCount: 0,
      totalCount: 5,
      achievementRate: 0,
    },
  ],
  averageAchievementRate: 68,
  totalCompleted: 17,
  totalRoutines: 25,
};

const monthlyDayRates = [
  80, 100, 60, 100, 40, 80, 100, 20, 60, 0, 100, 80, 60, 100, 40, 80, 100, 60,
  100, 80, 60,
];

const monthlyStats: MonthlyStats = {
  year: 2026,
  month: 5,
  days: monthlyDayRates.map((rate, i) => ({
    ...dailyBase,
    date: `2026-05-${String(i + 1).padStart(2, "0")}`,
    completedCount: Math.round((rate / 100) * 5),
    totalCount: 5,
    achievementRate: rate,
  })),
  averageAchievementRate: 72,
  totalCompleted: 68,
  totalRoutines: 105,
  bestDay: {
    date: "2026-05-19",
    completedCount: 5,
    totalCount: 5,
    achievementRate: 100,
  },
  worstDay: {
    date: "2026-05-10",
    completedCount: 0,
    totalCount: 5,
    achievementRate: 0,
  },
};

const categoryStats: CategoryStats[] = [
  { category: "health", completed: 18, total: 21, achievementRate: 86 },
  { category: "work", completed: 15, total: 21, achievementRate: 71 },
  { category: "study", completed: 12, total: 21, achievementRate: 57 },
  { category: "hobby", completed: 10, total: 21, achievementRate: 48 },
  { category: "life", completed: 13, total: 21, achievementRate: 62 },
];

export const WeekView: Story = {
  args: {
    viewMode: "week",
    weeklyStats,
    monthlyStats,
    categoryStats,
    year: 2026,
    month: 5,
  },
};

export const MonthView: Story = {
  args: {
    viewMode: "month",
    weeklyStats,
    monthlyStats,
    categoryStats,
    year: 2026,
    month: 5,
  },
};

export const CategoryView: Story = {
  args: {
    viewMode: "category",
    weeklyStats,
    monthlyStats,
    categoryStats,
    year: 2026,
    month: 5,
  },
};

export const PerfectWeek: Story = {
  args: {
    viewMode: "week",
    weeklyStats: {
      ...weeklyStats,
      averageAchievementRate: 100,
      totalCompleted: 25,
      totalRoutines: 25,
    },
    monthlyStats,
    categoryStats,
    year: 2026,
    month: 5,
  },
};

export const EmptyWeek: Story = {
  args: {
    viewMode: "week",
    weeklyStats: {
      ...weeklyStats,
      averageAchievementRate: 0,
      totalCompleted: 0,
      totalRoutines: 25,
    },
    monthlyStats,
    categoryStats,
    year: 2026,
    month: 5,
  },
};
