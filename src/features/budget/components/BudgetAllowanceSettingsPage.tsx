"use client";

import { CardPanel } from "@/components";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";
import { useBudgetExpenseItemManagementPageState } from "../useBudgetExpenseItemManagementPageState";
import { useBudgetAllowanceTransfer } from "../useBudgetAllowanceTransfer";
import { BudgetAllowanceItemForm } from "./BudgetAllowanceItemForm";
import { BudgetAllowanceItemRow } from "./BudgetAllowanceItemRow";
import { BudgetAllowanceSectionEmptyState } from "./BudgetAllowanceSectionEmptyState";
import { BudgetAllowanceSectionHeader } from "./BudgetAllowanceSectionHeader";
import { BudgetAllowanceTransferSection } from "./BudgetAllowanceTransferSection";
import { BudgetExpenseItemSection } from "./BudgetExpenseItemSection";
import texts from "../locales/ja.json";

export const BudgetAllowanceSettingsPage = () => {
  const income = useBudgetIncomeItemManagementPageState();
  const expense = useBudgetExpenseItemManagementPageState();
  const transfer = useBudgetAllowanceTransfer({
    onImported: () => {
      income.reloadItems();
      expense.reloadItems();
    },
  });
  const expenseSectionProps = {
    showForm: expense.showForm,
    editingItemId: expense.editingItemId,
    editingItemName: expense.editingItemName,
    editingItemAmount: expense.editingItemAmount,
    onToggleKind: expense.toggleItemKind,
    onChangeEditingName: expense.setEditingItemName,
    onChangeEditingAmount: expense.setEditingItemAmount,
    onCommitEdit: expense.commitEditItem,
    onCancelEdit: expense.cancelEditItem,
    onStartEdit: expense.startEditItem,
    onDelete: expense.handleDelete,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-black mb-2">
            {texts.allowanceSettings.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-600 mb-6">
            {texts.allowanceSettings.description}
          </p>

          <section className="mb-8">
            <BudgetAllowanceSectionHeader
              title={texts.allowanceSettings.incomeSectionTitle}
              showAddButton={!income.showForm}
              onAdd={income.openForm}
            />

            {income.showForm && (
              <BudgetAllowanceItemForm
                inputRef={income.inputRef}
                nameInput={income.nameInput}
                amountInput={income.amountInput}
                onChangeName={income.setNameInput}
                onChangeAmount={income.setAmountInput}
                onCreate={income.handleCreate}
                onCancel={income.closeForm}
              />
            )}

            {income.items.length === 0 && !income.showForm ? (
              <BudgetAllowanceSectionEmptyState />
            ) : (
              <div className="space-y-2">
                {income.items.map((item) => (
                  <BudgetAllowanceItemRow
                    key={item.id}
                    item={item}
                    isEditing={income.editingItemId === item.id}
                    editingName={income.editingItemName}
                    editingAmount={income.editingItemAmount}
                    onChangeEditingName={income.setEditingItemName}
                    onChangeEditingAmount={income.setEditingItemAmount}
                    onCommitEdit={income.commitEditItem}
                    onCancelEdit={income.cancelEditItem}
                    onStartEdit={income.startEditItem}
                    onDelete={income.handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <BudgetAllowanceSectionHeader
              title={
                <>
                  {texts.allowanceSettings.fixedExpenseSectionTitle} /{" "}
                  {texts.allowanceSettings.variableExpenseSectionTitle}
                </>
              }
              showAddButton={!expense.showForm}
              onAdd={() => expense.openForm("fixed")}
            />

            {expense.showForm && (
              <BudgetAllowanceItemForm
                inputRef={expense.inputRef}
                nameInput={expense.nameInput}
                amountInput={expense.amountInput}
                onChangeName={expense.setNameInput}
                onChangeAmount={expense.setAmountInput}
                onCreate={expense.handleCreate}
                onCancel={expense.closeForm}
                kind={expense.kindInput}
                onChangeKind={expense.setKindInput}
              />
            )}

            <BudgetExpenseItemSection
              title={texts.allowanceSettings.fixedExpenseSectionTitle}
              items={expense.fixedItems}
              listClassName="space-y-2 mb-4"
              {...expenseSectionProps}
            />

            <BudgetExpenseItemSection
              title={texts.allowanceSettings.variableExpenseSectionTitle}
              items={expense.variableItems}
              listClassName="space-y-2"
              {...expenseSectionProps}
            />
          </section>

          <BudgetAllowanceTransferSection
            fileInputRef={transfer.fileInputRef}
            status={transfer.status}
            isImporting={transfer.isImporting}
            onExport={transfer.handleExport}
            onImportClick={transfer.handleImportClick}
            onFileChange={transfer.handleFileChange}
          />
        </CardPanel>
      </main>
    </div>
  );
};
