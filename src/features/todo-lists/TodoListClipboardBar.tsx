"use client";

import texts from "./locales/ja.json";

export type TodoListClipboardBarProps = {
  clipboardCount: number;
  onPaste: () => void;
  onClearClipboard: () => void;
};

/**
 * クリップボードバー。
 * ペースト待ち件数の表示・ペースト・キャンセルを担当する。
 */
export const TodoListClipboardBar = ({
  clipboardCount,
  onPaste,
  onClearClipboard,
}: TodoListClipboardBarProps) => (
  <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
    <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
      📋{" "}
      {texts.list.pasteMessage.replace("{count}", String(clipboardCount))}
    </span>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onClearClipboard}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        {texts.list.cancelClipboardButton}
      </button>
      <button
        type="button"
        onClick={onPaste}
        className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
      >
        📋 {texts.list.pasteButton}
      </button>
    </div>
  </div>
);
