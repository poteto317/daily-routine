export interface Expense {
  id: string;
  date: string;
  amount: number;
  /** BudgetCategory.id への参照（未選択の場合は undefined） */
  categoryId?: string;
  createdAt: string;
  /**
   * 支出を追加した時刻（"HH:mm"、ローカル時刻）。実際にお金を使った時刻
   * ではない（これから使う予定の金額を入れる場合もある）。追加時に
   * 記録時刻（createdAt）と同じ瞬間から設定し、アプリの編集画面からは
   * 変更しない（Agent API からは指定・更新できる）。一覧で同じ`date`同士の
   * 並び順を決めるために使う。未設定の既存データは、createdAtの時刻部分に
   * フォールバックする。
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
