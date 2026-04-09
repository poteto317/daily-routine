import { type MealRecord } from "@/types/routine";
import { CardPanel } from "@/components";
import {
  formatMealDate,
  getMealTypeIcon,
  getMealTypeLabel,
} from "../utils/mealFormat";
import {
  formatMealRecentMemo,
  getMealRecentItemClassName,
  MEAL_RECENT_DELETE_LABEL,
  MEAL_RECENT_EMPTY_LABEL,
  MEAL_RECENT_TITLE,
  MEAL_RECENT_TODAY_BADGE,
} from "../helpers";

type MealRecentSectionProps = {
  meals: MealRecord[];
  today: string;
  onDeleteMeal: (date: string, mealId: string) => void;
};

export const MealRecentSection = ({
  meals,
  today,
  onDeleteMeal,
}: MealRecentSectionProps) => {
  return (
    <CardPanel className="mb-0!">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {MEAL_RECENT_TITLE}
      </h2>
      {meals.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-600 text-center py-8">
          {MEAL_RECENT_EMPTY_LABEL}
        </p>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => {
            const isToday = meal.date === today;
            return (
              <div
                key={meal.id}
                className={getMealRecentItemClassName(isToday)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getMealTypeIcon(meal.mealType)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-700">
                        {formatMealDate(meal.date)} {meal.time}
                        {isToday && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                            {MEAL_RECENT_TODAY_BADGE}
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-900">
                        {getMealTypeLabel(meal.mealType)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(meal.date, meal.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-700 dark:hover:text-red-800 text-sm font-medium"
                  >
                    {MEAL_RECENT_DELETE_LABEL}
                  </button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-800">
                  {meal.description}
                </p>
                {meal.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                    {formatMealRecentMemo(meal.notes)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardPanel>
  );
};
