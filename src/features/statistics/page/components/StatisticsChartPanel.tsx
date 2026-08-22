import { Bar, Doughnut, Line } from "react-chartjs-2";
import { type ChartData } from "chart.js";
import { doughnutOptions, chartOptions } from "../chartOptions";
import { type ViewMode } from "../types";
import { STATISTICS_CHART_PANEL_TEXT } from "../../statisticsChartPresentation";

type Props = {
  viewMode: ViewMode;
  weeklyChartData: ChartData<"bar", number[], string>;
  monthlyChartData: ChartData<"line", number[], number>;
  categoryChartData: ChartData<"doughnut", number[], string>;
  hasCategoryData: boolean;
};

export const StatisticsChartPanel = ({
  viewMode,
  weeklyChartData,
  monthlyChartData,
  categoryChartData,
  hasCategoryData,
}: Props) => (
  <div className="bg-gray-50 dark:bg-gray-100 rounded-lg p-6">
    <div style={{ height: "400px" }}>
      {viewMode === "week" && (
        <Bar data={weeklyChartData} options={chartOptions} />
      )}
      {viewMode === "month" && (
        <Line data={monthlyChartData} options={chartOptions} />
      )}
      {viewMode === "category" && hasCategoryData && (
        <Doughnut data={categoryChartData} options={doughnutOptions} />
      )}
      {viewMode === "category" && !hasCategoryData && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-600">
            {STATISTICS_CHART_PANEL_TEXT.noCategoryData}
          </p>
        </div>
      )}
    </div>
  </div>
);
