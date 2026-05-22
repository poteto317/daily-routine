import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatisticsCategoryDetailList } from "./StatisticsCategoryDetailList";
import type { CategoryStats } from "../../statistics/types";

const meta = {
  title: "Features/Statistics/StatisticsCategoryDetailList",
  component: StatisticsCategoryDetailList,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StatisticsCategoryDetailList>;

export default meta;
type Story = StoryObj<typeof meta>;

const categoryStats: CategoryStats[] = [
  { category: "health", completed: 18, total: 21, achievementRate: 85.7 },
  { category: "work",   completed: 15, total: 21, achievementRate: 71.4 },
  { category: "study",  completed: 12, total: 21, achievementRate: 57.1 },
  { category: "hobby",  completed: 10, total: 21, achievementRate: 47.6 },
  { category: "life",   completed: 13, total: 21, achievementRate: 61.9 },
  { category: "other",  completed:  5, total: 21, achievementRate: 23.8 },
];

export const AllCategories: Story = {
  args: { categoryStats },
};

export const PerfectScores: Story = {
  args: {
    categoryStats: categoryStats.map((s) => ({
      ...s,
      completed: s.total,
      achievementRate: 100,
    })),
  },
};

export const LowScores: Story = {
  args: {
    categoryStats: categoryStats.map((s) => ({
      ...s,
      completed: Math.floor(s.total * 0.2),
      achievementRate: 20,
    })),
  },
};

export const SingleCategory: Story = {
  args: { categoryStats: [categoryStats[0]] },
};
