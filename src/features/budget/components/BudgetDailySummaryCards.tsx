import { BudgetMoneyCard } from "./BudgetMoneyCard";
import { BudgetSummaryCardsGrid } from "./BudgetSummaryCardsGrid";
import budgetTexts from "../locales/ja.json";

type BudgetDailySummaryCardsProps = {
  dailyRemainingBudget: number;
  isCurrentMonth: boolean;
  todayExpense: number;
};

/**
 * 家計簿トップページに表示する、当月のみ関係する2枚のカード
 * （1日あたり使える金額・今日の支出）。月次サマリー（月に使える金額・
 * 使った金額・残り）は別ページ（BudgetSummaryPage）に分離している。
 */
export const BudgetDailySummaryCards = ({
  dailyRemainingBudget,
  isCurrentMonth,
  todayExpense,
}: BudgetDailySummaryCardsProps) => {
  if (!isCurrentMonth) {
    return null;
  }

  return (
    <BudgetSummaryCardsGrid>
      <BudgetMoneyCard
        cardClassName="bg-purple-50 dark:bg-purple-100 rounded-xl p-4"
        label={budgetTexts.summary.dailyRemainingLabel}
        value={Math.max(0, dailyRemainingBudget)}
        valueClassName="text-2xl font-bold text-purple-600 dark:text-purple-800"
      />
      <BudgetMoneyCard
        cardClassName="bg-cyan-50 dark:bg-cyan-100 rounded-xl p-4"
        label={budgetTexts.summary.todayLabel}
        value={todayExpense}
        valueClassName="text-2xl font-bold text-cyan-600 dark:text-cyan-800"
      />
    </BudgetSummaryCardsGrid>
  );
};
