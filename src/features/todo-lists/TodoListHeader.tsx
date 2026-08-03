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
  onChangeListTitleValueAction: (value: string) => void;
  onCommitEditListTitleAction: () => void;
  onCancelEditListTitleAction: () => void;
  onStartEditListTitleAction: () => void;
};

/**
 * Todo リストのヘッダー。
 * タイトル表示・インライン編集を担当する。
 */
export const TodoListHeader = ({
  list,
  editingListTitle,
  editingListTitleValue,
  listTitleInputRef,
  onChangeListTitleValueAction,
  onCommitEditListTitleAction,
  onCancelEditListTitleAction,
  onStartEditListTitleAction,
}: TodoListHeaderProps) => (
  <div className="flex items-start gap-2 mb-6">
    {editingListTitle ? (
      <input
        ref={listTitleInputRef}
        type="text"
        value={editingListTitleValue}
        onChange={(e) => onChangeListTitleValueAction(e.target.value)}
        onBlur={onCommitEditListTitleAction}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e))
            onCommitEditListTitleAction();
          if (e.key === "Escape") onCancelEditListTitleAction();
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
          onClick={onStartEditListTitleAction}
          className="shrink-0 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-sm"
          aria-label={texts.list.editListTitleLabel}
        >
          ✏️
        </button>
      </div>
    )}
  </div>
);
