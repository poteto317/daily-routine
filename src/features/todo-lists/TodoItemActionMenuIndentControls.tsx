"use client";

import {
  isIndentButtonDisabled,
  isOutdentButtonDisabled,
} from "./todoListItemIndentButtonDisabledState";

type Props = {
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  onOutdent: () => void;
  onIndent: () => void;
};

/**
 * アクションメニュー内のインデント上げ/下げボタン。
 * sortModeActive中は生配列の隣接関係が画面表示と乖離しうるため無効化する
 * （TodoItemIndentButtons.tsx と同じ理由）。
 */
export const TodoItemActionMenuIndentControls = ({
  currentIndent,
  maxIndent,
  sortModeActive,
  onOutdent,
  onIndent,
}: Props) => (
  <>
    <button
      type="button"
      onClick={onOutdent}
      disabled={isOutdentButtonDisabled(currentIndent, sortModeActive)}
      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
    >
      ← インデントを下げる
    </button>
    <button
      type="button"
      onClick={onIndent}
      disabled={isIndentButtonDisabled(currentIndent, maxIndent, sortModeActive)}
      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
    >
      → インデントを上げる
    </button>
  </>
);
