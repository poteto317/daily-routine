"use client";

import type { RefObject } from "react";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { TodoList } from "./types";
import texts from "./locales/ja.json";

export type TodoListHeaderProps = {
  list: TodoList;
  editingListTitle: boolean;
  editingListTitleValue: string;
  listTitleInputRef: RefObject<HTMLInputElement | null>;
  onChangeListTitleValue: (value: string) => void;
  onCommitEditListTitle: () => void;
  onCancelEditListTitle: () => void;
  onStartEditListTitle: () => void;
  onDeleteList: (list: TodoList) => void;
};

/**
 * Todo リストのヘッダー。
 * タイトル表示・インライン編集・削除ボタンを担当する。
 */
export const TodoListHeader = ({
  list,
  editingListTitle,
  editingListTitleValue,
  listTitleInputRef,
  onChangeListTitleValue,
  onCommitEditListTitle,
  onCancelEditListTitle,
  onStartEditListTitle,
  onDeleteList,
}: TodoListHeaderProps) => (
  <div className="flex items-start justify-between gap-2 mb-6">
    {editingListTitle ? (
      <input
        ref={listTitleInputRef}
        type="text"
        value={editingListTitleValue}
        onChange={(e) => onChangeListTitleValue(e.target.value)}
        onBlur={onCommitEditListTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e))
            onCommitEditListTitle();
          if (e.key === "Escape") onCancelEditListTitle();
        }}
        className="flex-1 text-xl font-bold px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-900 dark:text-black focus:outline-none"
      />
    ) : (
      <div className="flex items-center gap-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-black truncate">
          {list.title}
        </h1>
        <button
          type="button"
          onClick={onStartEditListTitle}
          className="shrink-0 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-sm"
          aria-label={texts.list.editListTitleLabel}
        >
          ✏️
        </button>
      </div>
    )}
    <button
      type="button"
      onClick={() => onDeleteList(list)}
      className="shrink-0 text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
    >
      {texts.list.deleteListButton}
    </button>
  </div>
);
