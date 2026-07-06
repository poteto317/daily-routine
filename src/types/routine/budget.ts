export interface MonthlyBudget {
  id: string;
  month: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  /** BudgetCategory.id への参照（未選択の場合は undefined） */
  categoryId?: string;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface BudgetData {
  budgets: { [month: string]: MonthlyBudget };
  expenses: { [month: string]: Expense[] };
}
