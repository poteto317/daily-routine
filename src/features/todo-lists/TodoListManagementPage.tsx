"use client";

import { CardPanel } from "@/components";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import texts from "./locales/ja.json";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";
import { isTodoListVisible } from "./managementPageStateActions";
import { useTodoListManagementPageState } from "./useTodoListManagementPageState";

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
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
              {texts.management.title}
            </h1>
            {!showForm && (
              <button
                type="button"
                onClick={openForm}
                className="text-sm bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                {texts.management.addButton}
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-600 mb-6">
            {texts.management.description}
          </p>

          {showForm && (
            <div className="mb-4 p-4 bg-teal-50 dark:bg-gray-700 border border-teal-200 dark:border-gray-500 rounded-xl">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                {texts.management.createTitle}
              </p>
              <input
                ref={inputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
                    handleCreate();
                  }
                  if (e.key === "Escape") {
                    closeForm();
                  }
                }}
                placeholder={texts.management.titlePlaceholder}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!titleInput.trim()}
                  className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {texts.management.createButton}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeForm();
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 px-3 py-2"
                >
                  {texts.management.cancelButton}
                </button>
              </div>
            </div>
          )}

          {lists.length === 0 && !showForm ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-sm font-medium">
                {texts.management.emptyMessage}
              </p>
              <p className="text-xs mt-1">
                {texts.management.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  {editingListId === list.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingListTitleValue}
                      onChange={(e) => setEditingListTitleValue(e.target.value)}
                      onBlur={commitEditListTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEditListTitle();
                        if (e.key === "Escape") cancelEditListTitle();
                      }}
                      className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => openList(list.id)}
                      className={`text-sm font-medium min-w-0 break-words text-left ${
                        isTodoListVisible(list)
                          ? "text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
                          : "text-gray-400 dark:text-gray-500 line-through"
                      }`}
                      aria-label={`${list.title} を開く`}
                    >
                      ✅ {list.title}
                    </button>
                  )}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {isTodoListVisible(list)
                        ? texts.management.visibleLabel
                        : texts.management.hiddenLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(list)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isTodoListVisible(list)
                          ? "bg-teal-500"
                          : "bg-gray-300 dark:bg-gray-500"
                      }`}
                      aria-label={`${list.title} の表示切替`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isTodoListVisible(list)
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    {editingListId !== list.id && (
                      <button
                        type="button"
                        onClick={() => startEditListTitle(list.id, list.title)}
                        className="text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-base leading-none"
                        aria-label={`${list.title} を編集`}
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(list)}
                      className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-base leading-none ml-1"
                      aria-label={`${list.title} を削除`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardPanel>
      </main>
    </div>
  );
};
