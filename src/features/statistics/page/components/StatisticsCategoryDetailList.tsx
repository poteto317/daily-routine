import { ROUTINE_CATEGORIES } from "@/types/routine";
import { type CategoryStats } from "../../statistics/types";
import { formatCategoryCompletionLabel } from "../../helpers";

type Props = { categoryStats: CategoryStats[] };

export const StatisticsCategoryDetailList = ({ categoryStats }: Props) => (
  <div className="mt-6 space-y-2">
    {categoryStats.map((stat) => {
      const category = ROUTINE_CATEGORIES.find(
        (item) => item.value === stat.category,
      );
      return (
        <div
          key={stat.category}
          className="bg-white dark:bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category?.emoji}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-900">
                  {category?.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-700">
                  {formatCategoryCompletionLabel(stat.completed, stat.total)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-700">
                {stat.achievementRate.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${stat.achievementRate}%` }}
            ></div>
          </div>
        </div>
      );
    })}
  </div>
);
