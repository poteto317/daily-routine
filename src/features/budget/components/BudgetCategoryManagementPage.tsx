"use client";

import { CardPanel } from "@/components";
import { useBudgetCategoryManagementPageState } from "../useBudgetCategoryManagementPageState";
import { BudgetCategoryManagementHeader } from "./BudgetCategoryManagementHeader";
import { BudgetCategoryCreateForm } from "./BudgetCategoryCreateForm";
import { BudgetCategoryManagementItem } from "./BudgetCategoryManagementItem";
import { BudgetCategoryManagementEmptyState } from "./BudgetCategoryManagementEmptyState";

export const BudgetCategoryManagementPage = () => {
  const {
    categories,
    inputRef,
    nameInput,
    showForm,
    setNameInput,
    openForm,
    closeForm,
    handleCreate,
    handleDelete,
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
  } = useBudgetCategoryManagementPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <BudgetCategoryManagementHeader
            showForm={showForm}
            onOpenForm={openForm}
          />

          {showForm && (
            <BudgetCategoryCreateForm
              inputRef={inputRef}
              nameInput={nameInput}
              onChangeName={setNameInput}
              onCreate={handleCreate}
              onCancel={closeForm}
            />
          )}

          {categories.length === 0 && !showForm ? (
            <BudgetCategoryManagementEmptyState />
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <BudgetCategoryManagementItem
                  key={category.id}
                  category={category}
                  editingCategoryId={editingCategoryId}
                  editingCategoryNameValue={editingCategoryNameValue}
                  onChangeNameValue={setEditingCategoryNameValue}
                  onCommitEdit={commitEditCategoryName}
                  onCancelEdit={cancelEditCategoryName}
                  onStartEdit={startEditCategoryName}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardPanel>
      </main>
    </div>
  );
};
