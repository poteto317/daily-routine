"use client";

import { CardPanel } from "@/components";
import { BudgetBudgetInputForm } from "@/features/budget/components/BudgetBudgetInputForm";
import { BudgetExpenseForm } from "@/features/budget/components/BudgetExpenseForm";
import { BudgetExpenseList } from "@/features/budget/components/BudgetExpenseList";
import { BudgetMonthNavigation } from "@/features/budget/components/BudgetMonthNavigation";
import { BudgetSummaryCards } from "@/features/budget/components/BudgetSummaryCards";
import { useBudgetPageState } from "@/features/budget/useBudgetPageState";
import budgetTexts from "@/features/budget/locales/ja.json";


export const BudgetPage = () => {
  const state = useBudgetPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel className="p-6! sm:p-8! mb-0!">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-black text-center">
              {budgetTexts.page.title}
            </h2>
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              {budgetTexts.page.betaLabel}
            </span>
          </div>
          <BudgetMonthNavigation
            currentDate={state.currentDate}
            isCurrentMonth={state.isCurrentMonth}
            onGoToCurrentMonth={state.goToCurrentMonth}
            onNextMonth={state.goToNextMonth}
            onPreviousMonth={state.goToPreviousMonth}
          />
          <BudgetSummaryCards
            dailyBudget={state.dailyBudget}
            dailyRemainingBudget={state.dailyRemainingBudget}
            daysRemaining={state.daysRemaining}
            expenseCount={state.expenses.length}
            isCurrentMonth={state.isCurrentMonth}
            monthBudget={state.monthBudget}
            onOpenBudgetInput={state.openBudgetInput}
            remaining={state.remaining}
            totalExpense={state.totalExpense}
          />
          {state.showBudgetInput && (
            <BudgetBudgetInputForm
              value={state.budgetInputValue}
              onChange={state.handleBudgetInputChange}
              onCancel={state.closeBudgetInput}
              onSave={state.handleSaveBudget}
            />
          )}
          {!state.showExpenseForm && (
            <button
              onClick={state.openExpenseForm}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold mb-6"
            >
              {budgetTexts.page.addExpenseLabel}
            </button>
          )}
          {state.showExpenseForm && (
            <BudgetExpenseForm
              currentDate={state.currentDate}
              expenseAmount={state.expenseAmount}
              expenseDate={state.expenseDate}
              expenseDescription={state.expenseDescription}
              onAdd={state.handleAddExpense}
              onAmountChange={state.handleExpenseAmountChange}
              onCancel={state.closeExpenseForm}
              onDateChange={state.handleExpenseDateChange}
              onDescriptionChange={state.handleExpenseDescriptionChange}
            />
          )}
          <BudgetExpenseList
            expenses={state.expenses}
            onDelete={(expenseId) => {
              if (window.confirm(budgetTexts.page.confirmDeleteExpense)) {
                state.handleDeleteExpense(expenseId);
              }
            }}
          />
        </CardPanel>
      </main>
    </div>
  );
};
