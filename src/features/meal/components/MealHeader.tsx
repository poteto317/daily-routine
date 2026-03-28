import { MEAL_HEADER_TEXT } from "../helpers";

export const MealHeader = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {MEAL_HEADER_TEXT.title}
        </h1>
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-200 text-purple-800 dark:text-purple-900 text-xs font-bold rounded-full">
          {MEAL_HEADER_TEXT.badge}
        </span>
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-900">
          {MEAL_HEADER_TEXT.info}
        </p>
      </div>
    </>
  );
};
