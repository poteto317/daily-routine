import { useMemo } from "react";
import type { BudgetCategory, Expense } from "@/types/routine";
import { buildBudgetCategoryLookup, resolveExpenseCategory } from "../helpers";
import { sortExpensesByDateDesc } from "../budgetExpenseListSort";
import budgetTexts from "../locales/ja.json";
import { BudgetExpenseListItem } from "./BudgetExpenseListItem";

type BudgetExpenseListProps = {
  categories: BudgetCategory[];
  expenses: Expense[];
  editingExpenseId: string | null;
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

export const BudgetExpenseList = ({
  categories,
  expenses,
  editingExpenseId,
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
}: BudgetExpenseListProps) => {
  const sortedExpenses = sortExpensesByDateDesc(expenses);
  const categoryLookup = useMemo(
    () => buildBudgetCategoryLookup(categories),
    [categories],
  );

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
            <BudgetExpenseListItem
              key={expense.id}
              expense={expense}
              category={resolveExpenseCategory(categoryLookup, expense)}
              categories={categories}
              isEditing={editingExpenseId === expense.id}
              editingExpenseDate={editingExpenseDate}
              editingExpenseAmount={editingExpenseAmount}
              editingExpenseCategoryId={editingExpenseCategoryId}
              editingExpenseUsedTime={editingExpenseUsedTime}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onEditDateChange={onEditDateChange}
              onEditAmountChange={onEditAmountChange}
              onEditCategoryIdChange={onEditCategoryIdChange}
              onEditUsedTimeChange={onEditUsedTimeChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
