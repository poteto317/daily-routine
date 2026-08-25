"use client";

import { useLongPress } from "@/hooks/useLongPress";
import { buildTodoItemTitleButtonAriaLabel } from "./todoItemTitleButtonAriaLabel";

type TodoItemTitleButtonProps = {
  title: string;
  isCompleted: boolean;
  isDragActive: boolean;
  isSelected: boolean;
  onToggleAction: () => void;
  onLongPressAction: () => void;
};

/**
 * Todoアイテムのタイトルボタン。
 * タップで完了/未完了をトグルし、長押しで選択状態をトグルする。
 * ドラッグ中（isDragActive）は disabled になる。
 */
export const TodoItemTitleButton = ({
  title,
  isCompleted,
  isDragActive,
  isSelected,
  onToggleAction,
  onLongPressAction,
}: TodoItemTitleButtonProps) => {
  const longPressHandlers = useLongPress({
    onLongPress: onLongPressAction,
    onClick: onToggleAction,
    disabled: isDragActive,
  });

  const ariaLabel = buildTodoItemTitleButtonAriaLabel({
    title,
    isCompleted,
    isSelected,
  });

  return (
    <button
      type="button"
      {...longPressHandlers}
      aria-label={ariaLabel}
      aria-pressed={isCompleted}
      disabled={isDragActive}
      className={`flex-1 min-w-0 text-sm break-words text-left disabled:cursor-not-allowed ${
        isCompleted
          ? "line-through text-gray-400 dark:text-gray-500"
          : "text-gray-800 dark:text-gray-100"
      }`}
    >
      {title}
    </button>
  );
};
