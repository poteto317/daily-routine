export interface Expense {
  id: string;
  date: string;
  amount: number;
  /** BudgetCategory.id への参照（未選択の場合は undefined） */
  categoryId?: string;
  createdAt: string;
  /**
   * 使用時刻（"HH:mm"、ローカル時刻）。一覧の並び順で同じ`date`同士を
   * 決着させるために使う。追加時は記録時刻（createdAt）と同じ値を
   * デフォルトとして設定し、編集で変更できる。未設定（記録済みの
   * 既存データ）の場合はcreatedAtの時刻部分にフォールバックする。
   */
  usedTime?: string;
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
