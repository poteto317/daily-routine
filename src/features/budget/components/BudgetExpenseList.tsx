import type { Expense } from "@/types/routine";
import { sortExpensesByDateDesc } from "../helpers";
import { formatExpenseDate } from "../utils/date";
import { formatCurrency } from "../utils/format";
import budgetTexts from "../locales/ja.json";

type BudgetExpenseListProps = {
  expenses: Expense[];
  onDelete: (expenseId: string) => void;
};

export const BudgetExpenseList = ({
  expenses,
  onDelete,
}: BudgetExpenseListProps) => {
  const sortedExpenses = sortExpensesByDateDesc(expenses);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-black mb-4">
        {budgetTexts.expenseList.title}
      </h3>
      {sortedExpenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-600">
          {budgetTexts.expenseList.empty}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-700 shrink-0">
                      {formatExpenseDate(expense.date)}
                    </span>
                    {expense.description && (
                      <span className="text-sm text-gray-900 dark:text-black truncate">
                        {expense.description}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-800">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="ml-4 px-3 py-2 bg-red-100 dark:bg-red-200 text-red-600 dark:text-red-800 rounded-lg hover:bg-red-200 dark:hover:bg-red-300 transition-colors shrink-0"
                >
                  {budgetTexts.expenseList.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
