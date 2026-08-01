"use client";

import { CardPanel } from "@/components";
import { useTodoCategoryManagementPageState } from "./useTodoCategoryManagementPageState";
import { TodoCategoryManagementHeader } from "./TodoCategoryManagementHeader";
import { TodoCategoryCreateForm } from "./TodoCategoryCreateForm";
import { TodoCategorySortableList } from "./TodoCategorySortableList";
import { TodoCategoryManagementEmptyState } from "./TodoCategoryManagementEmptyState";

export const TodoCategoryManagementPage = () => {
  const {
    categories,
    inputRef,
    nameInput,
    colorInput,
    showForm,
    setNameInput,
    setColorInput,
    openForm,
    closeForm,
    handleCreate,
    handleUpdateColor,
    handleDelete,
    editingCategoryId,
    editingCategoryNameValue,
    setEditingCategoryNameValue,
    startEditCategoryName,
    commitEditCategoryName,
    cancelEditCategoryName,
    colorEditingCategoryId,
    toggleCategoryColorPicker,
    closeCategoryColorPicker,
    dnd: { sensors, handleDragStart, handleDragEnd, handleDragCancel },
  } = useTodoCategoryManagementPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <TodoCategoryManagementHeader showForm={showForm} onOpenFormAction={openForm} />

          {showForm && (
            <TodoCategoryCreateForm
              inputRef={inputRef}
              nameInput={nameInput}
              colorInput={colorInput}
              onChangeNameAction={setNameInput}
              onChangeColorAction={setColorInput}
              onCreateAction={handleCreate}
              onCancelAction={closeForm}
            />
          )}

          {categories.length === 0 && !showForm ? (
            <TodoCategoryManagementEmptyState />
          ) : (
            <TodoCategorySortableList
              categories={categories}
              sensors={sensors}
              onDragStartAction={handleDragStart}
              onDragEndAction={handleDragEnd}
              onDragCancelAction={handleDragCancel}
              editingCategoryId={editingCategoryId}
              editingCategoryNameValue={editingCategoryNameValue}
              onChangeNameValueAction={setEditingCategoryNameValue}
              onCommitEditAction={commitEditCategoryName}
              onCancelEditAction={cancelEditCategoryName}
              onStartEditAction={startEditCategoryName}
              colorEditingCategoryId={colorEditingCategoryId}
              onToggleColorPickerAction={toggleCategoryColorPicker}
              onCloseColorPickerAction={closeCategoryColorPicker}
              onUpdateColorAction={handleUpdateColor}
              onDeleteAction={handleDelete}
            />
          )}
        </CardPanel>
      </main>
    </div>
  );
};
