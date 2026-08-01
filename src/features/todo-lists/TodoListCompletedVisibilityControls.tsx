"use client";

import texts from "./locales/ja.json";

export type TodoListCompletedVisibilityControlsProps = {
  hasCompletedItems: boolean;
  hideCompleted: boolean;
  onToggleHideCompletedAction: () => void;
};

export const TodoListCompletedVisibilityControls = ({
  hasCompletedItems,
  hideCompleted,
  onToggleHideCompletedAction,
}: TodoListCompletedVisibilityControlsProps) => {
  if (!hasCompletedItems) return null;

  return (
    <button
      type="button"
      aria-pressed={hideCompleted}
      onClick={onToggleHideCompletedAction}
      className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
    >
      {hideCompleted
        ? texts.list.completedHiddenLabel
        : texts.list.completedVisibleLabel}
    </button>
  );
};
