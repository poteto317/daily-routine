import { getCategoryInfo } from "@/features/routine";
import { type RoutineCategory } from "@/types/routine";
import { type ChartData } from "chart.js";
import { categoryChartColors } from "./chartOptions";
import { type useStatisticsPageState } from "./useStatisticsPageState";

type StatisticsState = ReturnType<typeof useStatisticsPageState>;

export const useStatisticsChartData = ({
  weeklyStats,
  monthlyStats,
  categoryStats,
}: Pick<StatisticsState, "weeklyStats" | "monthlyStats" | "categoryStats">) => {
  const weeklyChartData: ChartData<"bar", number[], string> = {
    labels: weeklyStats.days.map((day) => {
      const date = new Date(day.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: "達成率 (%)",
        data: weeklyStats.days.map((day) => day.achievementRate),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData: ChartData<"line", number[], number> = {
    labels: monthlyStats.days.map((day) => new Date(day.date).getDate()),
    datasets: [
      {
        label: "達成率 (%)",
        data: monthlyStats.days.map((day) => day.achievementRate),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryChartData: ChartData<"doughnut", number[], string> = {
    labels: categoryStats.map((stat) => {
      const category = getCategoryInfo({
        category: stat.category as RoutineCategory,
      });
      return `${category.emoji} ${category.label}`;
    }),
    datasets: [
      {
        label: "達成率 (%)",
        data: categoryStats.map((stat) => stat.achievementRate),
        backgroundColor: categoryChartColors,
      },
    ],
  };

  return { weeklyChartData, monthlyChartData, categoryChartData };
};
