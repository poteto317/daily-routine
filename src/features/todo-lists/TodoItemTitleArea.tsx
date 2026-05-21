"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import { TodoItemTitleButton } from "./TodoItemTitleButton";

type TodoItemTitleAreaProps = {
  itemId: string;
  title: string;
  isCompleted: boolean;
  isEditing: boolean;
  editingTitle: string;
  isDragActive: boolean;
  onChangeTitle: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onToggle: () => void;
};

/**
 * Todoアイテムのタイトルエリア。
 * 編集中は <input> を、通常時は TodoItemTitleButton を表示する。
 */
export const TodoItemTitleArea = ({
  itemId,
  title,
  isCompleted,
  isEditing,
  editingTitle,
  isDragActive,
  onChangeTitle,
  onCommitEdit,
  onCancelEdit,
  onToggle,
}: TodoItemTitleAreaProps) => {
  if (isEditing) {
    return (
      <input
        type="text"
        autoFocus
        value={editingTitle}
        onChange={(e) => onChangeTitle(e.target.value)}
        onBlur={onCommitEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e)) onCommitEdit();
          if (e.key === "Escape") onCancelEdit();
        }}
        aria-label={`「${title}」のタイトルを編集`}
        data-item-id={itemId}
        className="flex-1 min-w-0 text-sm px-1 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
      />
    );
  }

  return (
    <TodoItemTitleButton
      title={title}
      isCompleted={isCompleted}
      isDragActive={isDragActive}
      onToggle={onToggle}
    />
  );
};
