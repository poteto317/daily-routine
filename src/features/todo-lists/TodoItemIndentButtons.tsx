"use client";

type Props = {
  listId: string;
  itemId: string;
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  onIndentAction: (listId: string, itemId: string) => void;
  onOutdentAction: (listId: string, itemId: string) => void;
};

/**
 * デスクトップ用インデント上げ/下げボタン（ホバー時のみ表示）。
 * sortModeActive中は生配列の隣接関係が画面表示と乖離しうるため、
 * スワイプによるインデント変更（SortableTodoListItem.tsx の
 * canSwipeIndent）と同じ理由でボタンも無効化する。
 */
export const TodoItemIndentButtons = ({
  listId,
  itemId,
  currentIndent,
  maxIndent,
  sortModeActive,
  onIndentAction,
  onOutdentAction,
}: Props) => (
  <div className="hidden sm:flex shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
    <button
      type="button"
      onClick={() => onOutdentAction(listId, itemId)}
      disabled={currentIndent === 0 || sortModeActive}
      className="w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs rounded transition-colors"
      aria-label="インデントを下げる"
    >
      ←
    </button>
    <button
      type="button"
      onClick={() => onIndentAction(listId, itemId)}
      disabled={currentIndent >= maxIndent || sortModeActive}
      className="w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs rounded transition-colors"
      aria-label="インデントを上げる"
    >
      →
    </button>
  </div>
);
