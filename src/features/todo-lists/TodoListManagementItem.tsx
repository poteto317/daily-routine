"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoList } from "./types";
import { isTodoListVisible } from "./todoListVisibilityPredicate";
import { ToggleSwitch } from "@/components";
import { TodoItemDragHandle } from "./TodoItemDragHandle";
import texts from "./locales/ja.json";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";

type Props = {
  list: TodoList;
  editingListId: string | null;
  editingListTitleValue: string;
  onChangeTitleValueAction: (value: string) => void;
  onCommitEditAction: () => void;
  onCancelEditAction: () => void;
  onOpenListAction: (listId: string) => void;
  onToggleVisibilityAction: (list: TodoList) => void;
  onStartEditAction: (listId: string, title: string) => void;
  onDeleteAction: (list: TodoList) => void;
};

/**
 * 管理画面の個別リスト行（並び替えのハンドル・タイトル表示/編集・表示切替トグル・編集/削除ボタン）。
 * ドラッグはハンドル（TodoItemDragHandle）からだけ始まる。行の他の操作とは競合しない。
 */
export const TodoListManagementItem = ({
  list,
  editingListId,
  editingListTitleValue,
  onChangeTitleValueAction,
  onCommitEditAction,
  onCancelEditAction,
  onOpenListAction,
  onToggleVisibilityAction,
  onStartEditAction,
  onDeleteAction,
}: Props) => {
  const isEditing = editingListId === list.id;
  const isVisible = isTodoListVisible(list);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <TodoItemDragHandle attributes={attributes} listeners={listeners} />
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={editingListTitleValue}
            onChange={(e) => onChangeTitleValueAction(e.target.value)}
            onBlur={onCommitEditAction}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isImeComposingKeyDown(e))
                onCommitEditAction();
              if (e.key === "Escape") onCancelEditAction();
            }}
            className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => onOpenListAction(list.id)}
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
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {isVisible
            ? texts.management.visibleLabel
            : texts.management.hiddenLabel}
        </span>
        <ToggleSwitch
          checked={isVisible}
          label={`${list.title} の表示切替`}
          onToggle={() => onToggleVisibilityAction(list)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isVisible ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-500"
          }`}
          thumbClassName={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isVisible ? "translate-x-6" : "translate-x-1"
          }`}
        />
        {!isEditing && (
          <button
            type="button"
            onClick={() => onStartEditAction(list.id, list.title)}
            className="text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-base leading-none"
            aria-label={`${list.title} を編集`}
          >
            ✏️
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteAction(list)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-base leading-none ml-1"
          aria-label={`${list.title} を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
