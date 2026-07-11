"use client";

import texts from "./locales/ja.json";

export type TodoListCompletedVisibilityControlsProps = {
  hasCompletedItems: boolean;
  hideCompleted: boolean;
  moveCompletedToBottom: boolean;
  onToggleHideCompleted: () => void;
  onToggleMoveCompletedToBottom: () => void;
};

export const TodoListCompletedVisibilityControls = ({
  hasCompletedItems,
  hideCompleted,
  moveCompletedToBottom,
  onToggleHideCompleted,
  onToggleMoveCompletedToBottom,
}: TodoListCompletedVisibilityControlsProps) => {
  if (!hasCompletedItems) return null;

  return (
    <>
      {!hideCompleted && (
        <button
          type="button"
          aria-pressed={moveCompletedToBottom}
          onClick={onToggleMoveCompletedToBottom}
          className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
        >
          {moveCompletedToBottom
            ? texts.list.moveCompletedToBottom
            : texts.list.moveCompletedToBottomActive}
        </button>
      )}
      <button
        type="button"
        aria-pressed={hideCompleted}
        onClick={onToggleHideCompleted}
        className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
      >
        {hideCompleted ? texts.list.hideCompleted : texts.list.showCompleted}
      </button>
    </>
  );
};
