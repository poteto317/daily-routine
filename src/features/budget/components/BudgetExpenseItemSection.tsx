"use client";

import type { BudgetExpenseItem } from "@/types/routine";
import { BudgetAllowanceItemRow } from "./BudgetAllowanceItemRow";
import { BudgetAllowanceSectionEmptyState } from "./BudgetAllowanceSectionEmptyState";

type BudgetExpenseItemSectionProps = {
  title: string;
  items: BudgetExpenseItem[];
  showForm: boolean;
  listClassName: string;
  editingItemId: string | null;
  editingItemName: string;
  editingItemAmount: string;
  onToggleKind: (itemId: string) => void;
  onChangeEditingName: (value: string) => void;
  onChangeEditingAmount: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (item: BudgetExpenseItem) => void;
  onDelete: (item: BudgetExpenseItem) => void;
};

/** 支出項目（固定費/変動費）の1区分: 小見出しと、項目一覧または空状態。 */
export const BudgetExpenseItemSection = ({
  title,
  items,
  showForm,
  listClassName,
  editingItemId,
  editingItemName,
  editingItemAmount,
  onToggleKind,
  onChangeEditingName,
  onChangeEditingAmount,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: BudgetExpenseItemSectionProps) => (
  <>
    <h3 className="text-sm font-bold text-gray-600 dark:text-gray-700 mb-2">
      {title}
    </h3>
    {items.length === 0 && !showForm ? (
      <BudgetAllowanceSectionEmptyState />
    ) : (
      <div className={listClassName}>
        {items.map((item) => (
          <BudgetAllowanceItemRow
            key={item.id}
            item={item}
            kind={item.kind}
            onToggleKind={onToggleKind}
            isEditing={editingItemId === item.id}
            editingName={editingItemName}
            editingAmount={editingItemAmount}
            onChangeEditingName={onChangeEditingName}
            onChangeEditingAmount={onChangeEditingAmount}
            onCommitEdit={onCommitEdit}
            onCancelEdit={onCancelEdit}
            onStartEdit={onStartEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </>
);
