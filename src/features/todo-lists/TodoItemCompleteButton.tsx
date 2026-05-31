"use client";

type TodoItemCompleteButtonProps = {
  listId: string;
  itemId: string;
  isCompleted: boolean;
  isDragActive: boolean;
  onToggle: (listId: string, itemId: string) => void;
};

/**
 * Todo アイテムの完了/未完了トグルボタン。
 */
export const TodoItemCompleteButton = ({
  listId,
  itemId,
  isCompleted,
  isDragActive,
  onToggle,
}: TodoItemCompleteButtonProps) => (
  <button
    type="button"
    onClick={() => onToggle(listId, itemId)}
    disabled={isDragActive}
    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all disabled:cursor-not-allowed ${
      isCompleted
        ? "bg-teal-500 border-teal-500"
        : "border-gray-300 dark:border-gray-400 hover:border-teal-400"
    }`}
    aria-label={isCompleted ? "未完了に戻す" : "完了にする"}
  >
    {isCompleted && (
      <span className="text-white text-xs leading-none">✓</span>
    )}
  </button>
);
