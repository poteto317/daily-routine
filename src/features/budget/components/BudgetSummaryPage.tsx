"use client";

import { CardPanel } from "@/components";
import { useBudgetSummaryPageState } from "../useBudgetSummaryPageState";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";
import { BudgetMonthNavigation } from "./BudgetMonthNavigation";
import { BudgetMonthlySummaryCards } from "./BudgetMonthlySummaryCards";
import budgetTexts from "../locales/ja.json";

/**
 * 月次サマリーページ。家計簿トップページから移動した「月に使える金額・
 * 使った金額・残り」の3枚のカードのみを、独立した月ナビゲーション付きで
 * 表示する。
 */
export const BudgetSummaryPage = () => {
  const navigate = useNavigationContext();
  const state = useBudgetSummaryPageState({ navigate });

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel className="p-6! sm:p-8!">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-black text-center mb-2">
            {budgetTexts.summaryPage.title}
          </h2>
          <BudgetMonthNavigation
            currentDate={state.currentDate}
            isCurrentMonth={state.isCurrentMonth}
            onGoToCurrentMonth={state.goToCurrentMonth}
            onNextMonth={state.goToNextMonth}
            onPreviousMonth={state.goToPreviousMonth}
          />
          <BudgetMonthlySummaryCards
            dailyBudget={state.dailyBudget}
            expenseCount={state.expenseCount}
            monthlyAllowance={state.monthlyAllowance}
            onNavigateToAllowanceSettings={state.navigateToAllowanceSettings}
            remaining={state.remaining}
            totalExpense={state.totalExpense}
          />
        </CardPanel>
      </main>
    </div>
  );
};
