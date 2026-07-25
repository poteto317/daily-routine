import type { BudgetCategory, Expense } from "@/types/routine";
import { formatExpenseDate } from "../utils/date";
import { formatCurrency } from "../utils/format";
import budgetTexts from "../locales/ja.json";
import { BudgetExpenseDateSelect } from "./BudgetExpenseDateSelect";

type BudgetExpenseListItemProps = {
  expense: Expense;
  category: BudgetCategory | undefined;
  categories: BudgetCategory[];
  isEditing: boolean;
  editingExpenseDate: string;
  editingExpenseAmount: string;
  editingExpenseCategoryId: string;
  editingExpenseUsedTime: string;
  onStartEdit: (expense: Expense) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDateChange: (value: string) => void;
  onEditAmountChange: (value: string) => void;
  onEditCategoryIdChange: (value: string) => void;
  onEditUsedTimeChange: (value: string) => void;
  onDelete: (expenseId: string) => void;
};

/** 支出一覧の1行。通常は表示、編集中は日付・金額・カテゴリ・使用時刻の入力に切り替わる。 */
export const BudgetExpenseListItem = ({
  expense,
  category,
  categories,
  isEditing,
  editingExpenseDate,
  editingExpenseAmount,
  editingExpenseCategoryId,
  editingExpenseUsedTime,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDateChange,
  onEditAmountChange,
  onEditCategoryIdChange,
  onEditUsedTimeChange,
  onDelete,
}: BudgetExpenseListItemProps) => {
  if (isEditing) {
    return (
      <div className="bg-white dark:bg-white border border-blue-300 dark:border-blue-400 rounded-lg p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BudgetExpenseDateSelect
              value={editingExpenseDate}
              onChange={onEditDateChange}
            />
            <input
              type="number"
              value={editingExpenseAmount}
              onChange={(e) => onEditAmountChange(e.target.value)}
              placeholder={budgetTexts.expenseForm.amountPlaceholder}
              aria-label={budgetTexts.expenseForm.amountLabel}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
              {budgetTexts.expenseForm.usedTimeLabel}
            </label>
            <input
              type="time"
              value={editingExpenseUsedTime}
              onChange={(e) => onEditUsedTimeChange(e.target.value)}
              aria-label={budgetTexts.expenseForm.usedTimeLabel}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
            />
          </div>
          <select
            value={editingExpenseCategoryId}
            onChange={(e) => onEditCategoryIdChange(e.target.value)}
            aria-label={budgetTexts.expenseForm.categoryLabel}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
          >
            <option value="">
              {budgetTexts.expenseForm.categoryPlaceholder}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSaveEdit}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              {budgetTexts.expenseList.save}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              {budgetTexts.expenseList.cancelEdit}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
};
