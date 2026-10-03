import type { BudgetCategory, Expense } from "@/types/routine";
import { BudgetExpenseEditForm } from "./BudgetExpenseEditForm";
import { BudgetExpenseRow } from "./BudgetExpenseRow";

type BudgetExpenseListItemProps = {
  expense: Expense;
  category: BudgetCategory | undefined;
  categories: BudgetCategory[];
  isEditing: boolean;
  editingExpenseDate: string;
  editingExpenseAmount: string;
  editingExpenseCategoryId: string;
  onStartEdit: (expense: Expense) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDateChange: (value: string) => void;
  onEditAmountChange: (value: string) => void;
  onEditCategoryIdChange: (value: string) => void;
  onDelete: (expenseId: string) => void;
};

/** 支出一覧の1行。編集中かどうかで、編集フォームと表示行を切り替えるだけ。 */
export const BudgetExpenseListItem = ({
  expense,
  category,
  categories,
  isEditing,
  editingExpenseDate,
  editingExpenseAmount,
  editingExpenseCategoryId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDateChange,
  onEditAmountChange,
  onEditCategoryIdChange,
  onDelete,
}: BudgetExpenseListItemProps) =>
  isEditing ? (
    <BudgetExpenseEditForm
      categories={categories}
      editingExpenseDate={editingExpenseDate}
      editingExpenseAmount={editingExpenseAmount}
      editingExpenseCategoryId={editingExpenseCategoryId}
      onCancelEdit={onCancelEdit}
      onSaveEdit={onSaveEdit}
      onEditDateChange={onEditDateChange}
      onEditAmountChange={onEditAmountChange}
      onEditCategoryIdChange={onEditCategoryIdChange}
    />
  ) : (
    <BudgetExpenseRow
      expense={expense}
      category={category}
      onStartEdit={onStartEdit}
      onDelete={onDelete}
    />
  );
