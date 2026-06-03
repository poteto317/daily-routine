"use client";

import type { TodoList } from "./types";
import { isTodoListVisible } from "./todoListVisibilityPredicate";
import texts from "./locales/ja.json";

type Props = {
  list: TodoList;
  editingListId: string | null;
  editingListTitleValue: string;
  onChangeTitleValue: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onOpenList: (listId: string) => void;
  onToggleVisibility: (list: TodoList) => void;
  onStartEdit: (listId: string, title: string) => void;
  onDelete: (list: TodoList) => void;
};

/** 管理画面の個別リスト行（タイトル表示/編集・表示切替トグル・編集/削除ボタン）。 */
export const TodoListManagementItem = ({
  list,
  editingListId,
  editingListTitleValue,
  onChangeTitleValue,
  onCommitEdit,
  onCancelEdit,
  onOpenList,
  onToggleVisibility,
  onStartEdit,
  onDelete,
}: Props) => {
  const isEditing = editingListId === list.id;
  const isVisible = isTodoListVisible(list);

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      {isEditing ? (
        <input
          type="text"
          autoFocus
          value={editingListTitleValue}
          onChange={(e) => onChangeTitleValue(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitEdit();
            if (e.key === "Escape") onCancelEdit();
          }}
          className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => onOpenList(list.id)}
          className={`text-sm font-medium min-w-0 break-words text-left ${
            isVisible
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
          {isVisible ? texts.management.visibleLabel : texts.management.hiddenLabel}
        </span>
        <button
          type="button"
          onClick={() => onToggleVisibility(list)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isVisible ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-500"
          }`}
          aria-label={`${list.title} の表示切替`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isVisible ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        {!isEditing && (
          <button
            type="button"
            onClick={() => onStartEdit(list.id, list.title)}
            className="text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-base leading-none"
            aria-label={`${list.title} を編集`}
          >
            ✏️
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(list)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-base leading-none ml-1"
          aria-label={`${list.title} を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
