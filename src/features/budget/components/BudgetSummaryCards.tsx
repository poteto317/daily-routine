import { formatCurrency } from "../utils/format";
import type { MonthlyAllowance } from "../utils/monthlyAllowance";
import {
  getRemainingCardClassName,
  getRemainingTone,
  getRemainingValueClassName,
  shouldShowOverBudget,
} from "../helpers";
import budgetTexts from "../locales/ja.json";

type BudgetSummaryCardsProps = {
  dailyBudget: number;
  dailyRemainingBudget: number;
  daysRemaining: number;
  expenseCount: number;
  isCurrentMonth: boolean;
  monthBudget: number;
  monthlyAllowance: MonthlyAllowance;
  onNavigateToAllowanceSettings: () => void;
  remaining: number;
  todayExpense: number;
  totalExpense: number;
};

export const BudgetSummaryCards = ({
  dailyBudget,
  dailyRemainingBudget,
  daysRemaining,
  expenseCount,
  isCurrentMonth,
  monthBudget,
  monthlyAllowance,
  onNavigateToAllowanceSettings,
  remaining,
  todayExpense,
  totalExpense,
}: BudgetSummaryCardsProps) => {
  const remainingTone = getRemainingTone(remaining);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-700 dark:text-gray-900 font-medium">
            {budgetTexts.summary.monthlyLabel}
          </p>
          <button
            onClick={onNavigateToAllowanceSettings}
            className="text-xs text-blue-600 dark:text-blue-800 hover:underline"
          >
            {budgetTexts.summary.editAllowanceSettingsLabel}
          </button>
        </div>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-800">
          {formatCurrency(monthBudget)}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-800 mt-1">
          {budgetTexts.summary.dailyLabel}: {formatCurrency(dailyBudget)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-700 mt-2">
          {budgetTexts.summary.totalIncomeLabel}:{" "}
          {formatCurrency(monthlyAllowance.totalIncome)} /{" "}
          {budgetTexts.summary.totalFixedLabel}:{" "}
          {formatCurrency(monthlyAllowance.totalFixed)} /{" "}
          {budgetTexts.summary.totalVariableLabel}:{" "}
          {formatCurrency(monthlyAllowance.totalVariable)}
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-100 rounded-xl p-4">
        <p className="text-sm text-gray-700 dark:text-gray-900 font-medium mb-2">
          {budgetTexts.summary.usedLabel}
        </p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-800">
          {formatCurrency(totalExpense)}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-800 mt-1">
          {expenseCount} {budgetTexts.summary.expenseCountSuffix}
        </p>
      </div>

      <div className={getRemainingCardClassName(remainingTone)}>
        <p className="text-sm text-gray-700 dark:text-gray-900 font-medium mb-2">
          {budgetTexts.summary.remainingLabel}
        </p>
        <p className={getRemainingValueClassName(remainingTone)}>
          {formatCurrency(remaining)}
        </p>
        {shouldShowOverBudget(remainingTone) && (
          <p className="text-xs text-orange-600 dark:text-orange-800 mt-1">
            {budgetTexts.summary.overLabel}
          </p>
        )}
      </div>

      {isCurrentMonth && daysRemaining > 0 && (
        <div className="bg-purple-50 dark:bg-purple-100 rounded-xl p-4">
          <p className="text-sm text-gray-700 dark:text-gray-900 font-medium mb-2">
            {budgetTexts.summary.dailyRemainingLabel}
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-800">
            {formatCurrency(Math.max(0, dailyRemainingBudget))}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-800 mt-1">
            {budgetTexts.summary.daysRemainingPrefix}
            {daysRemaining}
            {budgetTexts.summary.daysRemainingSuffix}
          </p>
        </div>
      )}

      {isCurrentMonth && (
        <div className="bg-cyan-50 dark:bg-cyan-100 rounded-xl p-4">
          <p className="text-sm text-gray-700 dark:text-gray-900 font-medium mb-2">
            {budgetTexts.summary.todayLabel}
          </p>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-800">
            {formatCurrency(todayExpense)}
          </p>
        </div>
      )}
    </div>
  );
};
