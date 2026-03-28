import { formatBudgetMonthLabel } from "../helpers";
import budgetTexts from "../locales/ja.json";

type BudgetMonthNavigationProps = {
  currentDate: Date;
  isCurrentMonth: boolean;
  onGoToCurrentMonth: () => void;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
};

export const BudgetMonthNavigation = ({
  currentDate,
  isCurrentMonth,
  onGoToCurrentMonth,
  onNextMonth,
  onPreviousMonth,
}: BudgetMonthNavigationProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPreviousMonth}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors"
      >
        {budgetTexts.monthNavigation.previousMonth}
      </button>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-black">
          {formatBudgetMonthLabel(currentDate)}
        </h3>
        {!isCurrentMonth && (
          <button
            onClick={onGoToCurrentMonth}
            className="text-sm text-blue-600 dark:text-blue-800 hover:underline mt-1"
          >
            {budgetTexts.monthNavigation.goToCurrentMonth}
          </button>
        )}
      </div>
      <button
        onClick={onNextMonth}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors"
      >
        {budgetTexts.monthNavigation.nextMonth}
      </button>
    </div>
  );
};
