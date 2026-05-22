import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import "@/features/statistics/page/chartRegistration";
import { StatisticsChartPanel } from "./StatisticsChartPanel";
import { categoryChartColors } from "../chartOptions";

const meta = {
  title: "Features/Statistics/StatisticsChartPanel",
  component: StatisticsChartPanel,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StatisticsChartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const weekDayLabels = ["月", "火", "水", "木", "金", "土", "日"];
const weeklyData = [80, 100, 60, 100, 40, 0, 0];

const weeklyChartData = {
  labels: weekDayLabels,
  datasets: [
    {
      label: "達成率",
      data: weeklyData,
      backgroundColor: weeklyData.map((v) =>
        v >= 80 ? "rgba(34, 197, 94, 0.8)" : v >= 50 ? "rgba(59, 130, 246, 0.8)" : "rgba(156, 163, 175, 0.6)",
      ),
      borderRadius: 4,
    },
  ],
};

const monthlyChartData = {
  labels: Array.from({ length: 21 }, (_, i) => i + 1),
  datasets: [
    {
      label: "達成率",
      data: [80, 100, 0, 60, 80, 100, 40, 100, 80, 60, 100, 80, 0, 60, 100, 80, 60, 100, 80, 100, 60],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.3,
      fill: true,
    },
  ],
};

const categoryLabels = ["健康", "仕事", "学習", "趣味", "生活", "その他"];
const categoryValues = [86, 71, 57, 48, 62, 24];

const categoryChartData = {
  labels: categoryLabels,
  datasets: [
    {
      data: categoryValues,
      backgroundColor: categoryChartColors,
    },
  ],
};

export const WeekView: Story = {
  args: {
    viewMode: "week",
    weeklyChartData,
    monthlyChartData,
    categoryChartData,
    hasCategoryData: true,
  },
};

export const MonthView: Story = {
  args: {
    viewMode: "month",
    weeklyChartData,
    monthlyChartData,
    categoryChartData,
    hasCategoryData: true,
  },
};

export const CategoryView: Story = {
  args: {
    viewMode: "category",
    weeklyChartData,
    monthlyChartData,
    categoryChartData,
    hasCategoryData: true,
  },
};

export const CategoryViewNoData: Story = {
  args: {
    viewMode: "category",
    weeklyChartData,
    monthlyChartData,
    categoryChartData,
    hasCategoryData: false,
  },
};
