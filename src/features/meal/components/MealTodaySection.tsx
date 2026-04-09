import type { MealRecord } from "@/types/routine";
import {
  formatMealDate,
  getMealTypeIcon,
  getMealTypeLabel,
  sortMealsByTimeAsc,
} from "../utils/mealFormat";
import {
  formatMealNotes,
  MEAL_TODAY_ADD_LABEL,
  MEAL_TODAY_DELETE_LABEL,
  MEAL_TODAY_EMPTY_LABEL,
  MEAL_TODAY_TITLE_LABEL,
} from "../helpers";

type MealTodaySectionProps = {
  meals: MealRecord[];
  showForm: boolean;
  today: string;
  onDeleteMeal: (date: string, mealId: string) => void;
  onOpenForm: () => void;
  form: React.ReactNode;
};

export const MealTodaySection = ({
  meals,
  showForm,
  today,
  onDeleteMeal,
  onOpenForm,
  form,
}: MealTodaySectionProps) => {
  const sortedMeals = sortMealsByTimeAsc(meals);

  return (
    <div className="mb-6 p-4 bg-green-50 dark:bg-green-100 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
          {MEAL_TODAY_TITLE_LABEL} ({formatMealDate(today)})
        </h2>
        {!showForm && (
          <button
            onClick={onOpenForm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            {MEAL_TODAY_ADD_LABEL}
          </button>
        )}
      </div>

      {showForm && form}

      {!showForm && sortedMeals.length > 0 && (
        <div className="space-y-2 mt-3">
          {sortedMeals.map((meal) => (
            <div
              key={meal.id}
              className="p-3 bg-white dark:bg-slate-50 rounded-lg border border-gray-200 dark:border-gray-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {getMealTypeIcon(meal.mealType)}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-900">
                      {getMealTypeLabel(meal.mealType)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-700">
                      {meal.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-800">
                    {meal.description}
                  </p>
                  {meal.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                      {formatMealNotes(meal.notes)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteMeal(meal.date, meal.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-700 dark:hover:text-red-800 text-sm font-medium ml-2"
                >
                  {MEAL_TODAY_DELETE_LABEL}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && sortedMeals.length === 0 && (
        <p className="text-gray-500 dark:text-gray-600 text-sm text-center py-4">
          {MEAL_TODAY_EMPTY_LABEL}
        </p>
      )}
    </div>
  );
};
