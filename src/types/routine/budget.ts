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
  category?: string;
  description?: string;
  createdAt: string;
}

export interface BudgetData {
  budgets: { [month: string]: MonthlyBudget };
  expenses: { [month: string]: Expense[] };
}
