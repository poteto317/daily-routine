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
  isSelected: boolean;
  onChangeTitleAction: (v: string) => void;
  onCommitEditAction: () => void;
  onCancelEditAction: () => void;
  onToggleAction: () => void;
  onLongPressAction: () => void;
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
  isSelected,
  onChangeTitleAction,
  onCommitEditAction,
  onCancelEditAction,
  onToggleAction,
  onLongPressAction,
}: TodoItemTitleAreaProps) => {
  if (isEditing) {
    return (
      <input
        type="text"
        autoFocus
        value={editingTitle}
        onChange={(e) => onChangeTitleAction(e.target.value)}
        onBlur={onCommitEditAction}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e))
            onCommitEditAction();
          if (e.key === "Escape") onCancelEditAction();
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
      isSelected={isSelected}
      onToggleAction={onToggleAction}
      onLongPressAction={onLongPressAction}
    />
  );
};
