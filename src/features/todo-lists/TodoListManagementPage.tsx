"use client";

import { CardPanel } from "@/components";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";
import { useTodoListManagementPageState } from "./useTodoListManagementPageState";
import { TodoListCreateForm } from "./TodoListCreateForm";
import { TodoListManagementItem } from "./TodoListManagementItem";
import { TodoListManagementHeader } from "./TodoListManagementHeader";
import { TodoListManagementEmptyState } from "./TodoListManagementEmptyState";

export const TodoListManagementPage = () => {
  const navigate = useNavigationContext();
  const {
    editingListId,
    editingListTitleValue,
    inputRef,
    lists,
    showForm,
    titleInput,
    cancelEditListTitle,
    closeForm,
    commitEditListTitle,
    handleCreate,
    handleDelete,
    handleToggleVisibility,
    openForm,
    openList,
    setEditingListTitleValue,
    setTitleInput,
    startEditListTitle,
  } = useTodoListManagementPageState({ navigate });

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <TodoListManagementHeader showForm={showForm} onOpenForm={openForm} />

          {showForm && (
            <TodoListCreateForm
              inputRef={inputRef}
              titleInput={titleInput}
              onChangeTitle={setTitleInput}
              onCreate={handleCreate}
              onCancel={closeForm}
            />
          )}

          {lists.length === 0 && !showForm ? (
            <TodoListManagementEmptyState />
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <TodoListManagementItem
                  key={list.id}
                  list={list}
                  editingListId={editingListId}
                  editingListTitleValue={editingListTitleValue}
                  onChangeTitleValue={setEditingListTitleValue}
                  onCommitEdit={commitEditListTitle}
                  onCancelEdit={cancelEditListTitle}
                  onOpenList={openList}
                  onToggleVisibility={handleToggleVisibility}
                  onStartEdit={startEditListTitle}
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

