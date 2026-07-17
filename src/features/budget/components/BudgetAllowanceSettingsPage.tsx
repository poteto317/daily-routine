"use client";

import { CardPanel } from "@/components";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";
import { useBudgetExpenseItemManagementPageState } from "../useBudgetExpenseItemManagementPageState";
import { BudgetAllowanceItemForm } from "./BudgetAllowanceItemForm";
import { BudgetAllowanceItemRow } from "./BudgetAllowanceItemRow";
import { BudgetAllowanceSectionEmptyState } from "./BudgetAllowanceSectionEmptyState";
import texts from "../locales/ja.json";

export const BudgetAllowanceSettingsPage = () => {
  const income = useBudgetIncomeItemManagementPageState();
  const expense = useBudgetExpenseItemManagementPageState();

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
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900">
                {texts.allowanceSettings.incomeSectionTitle}
              </h2>
              {!income.showForm && (
                <button
                  type="button"
                  onClick={income.openForm}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  {texts.allowanceSettings.addButton}
                </button>
              )}
            </div>

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
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900">
                {texts.allowanceSettings.fixedExpenseSectionTitle} /{" "}
                {texts.allowanceSettings.variableExpenseSectionTitle}
              </h2>
              {!expense.showForm && (
                <button
                  type="button"
                  onClick={() => expense.openForm("fixed")}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  {texts.allowanceSettings.addButton}
                </button>
              )}
            </div>

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

            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-700 mb-2">
              {texts.allowanceSettings.fixedExpenseSectionTitle}
            </h3>
            {expense.fixedItems.length === 0 && !expense.showForm ? (
              <BudgetAllowanceSectionEmptyState />
            ) : (
              <div className="space-y-2 mb-4">
                {expense.fixedItems.map((item) => (
                  <BudgetAllowanceItemRow
                    key={item.id}
                    item={item}
                    kind={item.kind}
                    onToggleKind={expense.toggleItemKind}
                    isEditing={expense.editingItemId === item.id}
                    editingName={expense.editingItemName}
                    editingAmount={expense.editingItemAmount}
                    onChangeEditingName={expense.setEditingItemName}
                    onChangeEditingAmount={expense.setEditingItemAmount}
                    onCommitEdit={expense.commitEditItem}
                    onCancelEdit={expense.cancelEditItem}
                    onStartEdit={expense.startEditItem}
                    onDelete={expense.handleDelete}
                  />
                ))}
              </div>
            )}

            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-700 mb-2">
              {texts.allowanceSettings.variableExpenseSectionTitle}
            </h3>
            {expense.variableItems.length === 0 && !expense.showForm ? (
              <BudgetAllowanceSectionEmptyState />
            ) : (
              <div className="space-y-2">
                {expense.variableItems.map((item) => (
                  <BudgetAllowanceItemRow
                    key={item.id}
                    item={item}
                    kind={item.kind}
                    onToggleKind={expense.toggleItemKind}
                    isEditing={expense.editingItemId === item.id}
                    editingName={expense.editingItemName}
                    editingAmount={expense.editingItemAmount}
                    onChangeEditingName={expense.setEditingItemName}
                    onChangeEditingAmount={expense.setEditingItemAmount}
                    onCommitEdit={expense.commitEditItem}
                    onCancelEdit={expense.cancelEditItem}
                    onStartEdit={expense.startEditItem}
                    onDelete={expense.handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </CardPanel>
      </main>
    </div>
  );
};
