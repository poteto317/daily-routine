"use client";

import texts from "./locales/ja.json";

export type TodoListClipboardBarProps = {
  clipboardCount: number;
  onPasteAction: () => void;
  onClearClipboardAction: () => void;
};

/**
 * クリップボードバー。
 * ペースト待ち件数の表示・ペースト・キャンセルを担当する。
 */
export const TodoListClipboardBar = ({
  clipboardCount,
  onPasteAction,
  onClearClipboardAction,
}: TodoListClipboardBarProps) => (
  <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-100 border border-amber-200 dark:border-amber-300 rounded-xl">
    <span className="text-sm text-amber-700 dark:text-amber-800 font-medium">
      📋 {texts.list.pasteMessage.replace("{count}", String(clipboardCount))}
    </span>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onClearClipboardAction}
        className="text-xs text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-800 transition-colors"
      >
        {texts.list.cancelClipboardButton}
      </button>
      <button
        type="button"
        onClick={onPasteAction}
        className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
      >
        📋 {texts.list.pasteButton}
      </button>
    </div>
  </div>
);
