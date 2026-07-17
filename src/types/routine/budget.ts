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
  expenses: { [month: string]: Expense[] };
}

/** 収入項目。月に紐付かないテンプレートとして、金額が変わったときだけ編集する。 */
export interface BudgetIncomeItem {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

export type BudgetExpenseItemKind = "fixed" | "variable";

/** 支出項目。kindで固定費("fixed")・変動費("variable")を区別する。 */
export interface BudgetExpenseItem {
  id: string;
  name: string;
  amount: number;
  kind: BudgetExpenseItemKind;
  createdAt: string;
}
