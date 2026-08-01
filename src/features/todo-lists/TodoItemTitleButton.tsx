"use client";

type TodoItemTitleButtonProps = {
  title: string;
  isCompleted: boolean;
  isDragActive: boolean;
  onToggleAction: () => void;
};

/**
 * Todoアイテムのタイトルボタン。
 * クリックで完了/未完了をトグルする。
 * ドラッグ中（isDragActive）は disabled になる。
 */
export const TodoItemTitleButton = ({
  title,
  isCompleted,
  isDragActive,
  onToggleAction,
}: TodoItemTitleButtonProps) => (
  <button
    type="button"
    onClick={onToggleAction}
    aria-label={isCompleted ? `「${title}」を未完了に戻す` : `「${title}」を完了にする`}
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
