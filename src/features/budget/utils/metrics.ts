import { Expense } from "@/types/routine";
import { daysInMonth, isCurrentMonthDate } from "./date";

type BudgetMetrics = {
  dailyBudget: number;
  dailyRemainingBudget: number;
  daysRemaining: number;
  isCurrentMonth: boolean;
  remaining: number;
  totalExpense: number;
};

export const calculateBudgetMetrics = (
  currentDate: Date,
  monthBudget: number,
  expenses: Expense[],
): BudgetMetrics => {
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const remaining = monthBudget - totalExpense;
  const currentMonthDays = daysInMonth(currentDate);
  const dailyBudget = monthBudget > 0 ? monthBudget / currentMonthDays : 0;
  const isCurrentMonth = isCurrentMonthDate(currentDate);
  const daysRemaining = isCurrentMonth
    ? currentMonthDays - new Date().getDate() + 1
    : 0;
  const dailyRemainingBudget =
    daysRemaining > 0 ? remaining / daysRemaining : 0;

  return {
    dailyBudget,
    dailyRemainingBudget,
    daysRemaining,
    isCurrentMonth,
    remaining,
    totalExpense,
  };
};
