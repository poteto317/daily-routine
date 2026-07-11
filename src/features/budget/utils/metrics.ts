import { type Expense } from "@/types/routine";
import { daysInMonth, isCurrentMonthDate, toDateKey } from "./date";

type BudgetMetrics = {
  dailyBudget: number;
  dailyRemainingBudget: number;
  daysRemaining: number;
  isCurrentMonth: boolean;
  remaining: number;
  todayExpense: number;
  totalExpense: number;
};

export const calculateBudgetMetrics = (
  currentDate: Date,
  monthBudget: number,
  expenses: Expense[],
): BudgetMetrics => {
  const now = new Date();
  const todayKey = toDateKey(now);
  let totalExpense = 0;
  let todayExpense = 0;
  for (const expense of expenses) {
    totalExpense += expense.amount;
    if (expense.date === todayKey) {
      todayExpense += expense.amount;
    }
  }
  const remaining = monthBudget - totalExpense;
  const currentMonthDays = daysInMonth(currentDate);
  const dailyBudget = monthBudget > 0 ? monthBudget / currentMonthDays : 0;
  const isCurrentMonth = isCurrentMonthDate(currentDate, now);
  const daysRemaining = isCurrentMonth
    ? currentMonthDays - now.getDate() + 1
    : 0;
  const dailyRemainingBudget =
    daysRemaining > 0 ? remaining / daysRemaining : 0;

  return {
    dailyBudget,
    dailyRemainingBudget,
    daysRemaining,
    isCurrentMonth,
    remaining,
    todayExpense,
    totalExpense,
  };
};
