"use client";

type TodoItemCollapseButtonProps = {
  itemId: string;
  isParent: boolean;
  isCollapsed: boolean;
  onToggleCollapseAction: (id: string) => void;
};

/**
 * 親アイテムの折りたたみ/展開ボタン。
 * 子要素を持たない場合はスペーサー表示。
 */
export const TodoItemCollapseButton = ({
  itemId,
  isParent,
  isCollapsed,
  onToggleCollapseAction,
}: TodoItemCollapseButtonProps) => {
  if (!isParent) {
    return <span className="shrink-0 w-5" />;
  }

  return (
    <button
      type="button"
      onClick={() => onToggleCollapseAction(itemId)}
      className="shrink-0 w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 flex items-center justify-center text-xs transition-colors"
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? "子Todoを展開" : "子Todoを折りたたむ"}
    >
      {isCollapsed ? "▶" : "▼"}
    </button>
  );
};
