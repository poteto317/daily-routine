import { formatCurrency } from "../utils/format";
import type { MonthlyAllowance } from "../utils/monthlyAllowance";
import {
  getRemainingCardClassName,
  getRemainingTone,
  getRemainingValueClassName,
  shouldShowOverBudget,
} from "../helpers";
import { BudgetMoneyCard } from "./BudgetMoneyCard";
import { BudgetSummaryCardsGrid } from "./BudgetSummaryCardsGrid";
import budgetTexts from "../locales/ja.json";

type BudgetMonthlySummaryCardsProps = {
  dailyBudget: number;
  expenseCount: number;
  monthlyAllowance: MonthlyAllowance;
  onNavigateToAllowanceSettings: () => void;
  remaining: number;
  totalExpense: number;
};

/**
 * 月次サマリーページに表示する3枚のカード
 * （月に使える金額・使った金額・残り）。
 * 「月に使える金額」は monthlyAllowance.allowance から導出する
 * （別途 monthBudget propとして受け取らないことで、2つの値が
 * 食い違う可能性を排除する）。
 */
export const BudgetMonthlySummaryCards = ({
  dailyBudget,
  expenseCount,
  monthlyAllowance,
  onNavigateToAllowanceSettings,
  remaining,
  totalExpense,
}: BudgetMonthlySummaryCardsProps) => {
  const remainingTone = getRemainingTone(remaining);

  return (
    <BudgetSummaryCardsGrid>
      <BudgetMoneyCard
        cardClassName="bg-blue-50 dark:bg-blue-100 rounded-xl p-4"
        label={budgetTexts.summary.monthlyLabel}
        labelAction={
          <button
            onClick={onNavigateToAllowanceSettings}
            className="text-xs text-blue-600 dark:text-blue-800 hover:underline"
          >
            {budgetTexts.summary.editAllowanceSettingsLabel}
          </button>
        }
        value={monthlyAllowance.allowance}
        valueClassName="text-2xl font-bold text-blue-600 dark:text-blue-800"
      >
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
      </BudgetMoneyCard>

      <BudgetMoneyCard
        cardClassName="bg-red-50 dark:bg-red-100 rounded-xl p-4"
        label={budgetTexts.summary.usedLabel}
        value={totalExpense}
        valueClassName="text-2xl font-bold text-red-600 dark:text-red-800"
      >
        <p className="text-xs text-gray-600 dark:text-gray-800 mt-1">
          {expenseCount} {budgetTexts.summary.expenseCountSuffix}
        </p>
      </BudgetMoneyCard>

      <BudgetMoneyCard
        cardClassName={getRemainingCardClassName(remainingTone)}
        label={budgetTexts.summary.remainingLabel}
        value={remaining}
        valueClassName={getRemainingValueClassName(remainingTone)}
      >
        {shouldShowOverBudget(remainingTone) && (
          <p className="text-xs text-orange-600 dark:text-orange-800 mt-1">
            {budgetTexts.summary.overLabel}
          </p>
        )}
      </BudgetMoneyCard>
    </BudgetSummaryCardsGrid>
  );
};
