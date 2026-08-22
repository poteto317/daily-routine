import {
  type CategoryStats,
  type MonthlyStats,
  type WeeklyStats,
} from "../../statistics/types";
import { type ViewMode } from "../types";
import {
  getCategoryCountLabel,
  getCategorySummaryLabel,
  getMonthlySummaryCards,
  getWeeklySummaryCards,
} from "../../statisticsSummaryPresentation";

type Props = {
  viewMode: ViewMode;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
  categoryStats: CategoryStats[];
  year: number;
  month: number;
};

export const StatisticsSummaryCards = ({
  viewMode,
  weeklyStats,
  monthlyStats,
  categoryStats,
  year,
  month,
}: Props) => {
  const cards =
    viewMode === "week"
      ? getWeeklySummaryCards(weeklyStats)
      : viewMode === "month"
        ? getMonthlySummaryCards(monthlyStats)
        : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.id} className={card.containerClassName}>
          <div className="text-sm text-gray-600 dark:text-gray-700 mb-1">
            {card.title}
          </div>
          <div className={card.valueClassName}>{card.value}</div>
        </div>
      ))}

      {viewMode === "category" && (
        <div className="col-span-3 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-100 dark:to-purple-100 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-700 mb-1">
            {getCategorySummaryLabel(year, month)}
          </div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-900">
            {getCategoryCountLabel(categoryStats)}
          </div>
        </div>
      )}
    </div>
  );
};
