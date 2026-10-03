export type Expense = {
  id: string;
  date: string;
  amount: number;
  categoryId?: string;
  createdAt: string;
  usedTime?: string;
};

/** 月（YYYY-MM）ごとの支出一覧。アプリの budgetData.expenses と同じ形 */
export type ExpensesByMonth = Record<string, Expense[]>;

export type FoundExpense = { month: string; expense: Expense };
