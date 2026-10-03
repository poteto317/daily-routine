import type { BudgetCategory, Expense } from "@/types/routine";
import { formatExpenseDate } from "../utils/date";
import { formatCurrency } from "../utils/format";
import budgetTexts from "../locales/ja.json";

type BudgetExpenseRowProps = {
  expense: Expense;
  category: BudgetCategory | undefined;
  onStartEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
};

/** 支出1件の表示行（日付・カテゴリ・金額と、編集・削除ボタン）。 */
export const BudgetExpenseRow = ({
  expense,
  category,
  onStartEdit,
  onDelete,
}: BudgetExpenseRowProps) => (
  <div className="bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-700 shrink-0">
            {formatExpenseDate(expense.date)}
          </span>
          {category && (
            <span className="text-sm text-gray-900 dark:text-black truncate">
              🏷️ {category.name}
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-red-600 dark:text-red-800">
          {formatCurrency(expense.amount)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onStartEdit(expense)}
        className="ml-4 px-3 py-2 bg-blue-100 dark:bg-blue-200 text-blue-600 dark:text-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors shrink-0"
        aria-label={`${formatExpenseDate(expense.date)}の支出を編集`}
      >
        {budgetTexts.expenseList.edit}
      </button>
      <button
        type="button"
        onClick={() => onDelete(expense.id)}
        className="ml-2 px-3 py-2 bg-red-100 dark:bg-red-200 text-red-600 dark:text-red-800 rounded-lg hover:bg-red-200 dark:hover:bg-red-300 transition-colors shrink-0"
        aria-label={`${formatExpenseDate(expense.date)}の支出を削除`}
      >
        {budgetTexts.expenseList.delete}
      </button>
    </div>
  </div>
);
