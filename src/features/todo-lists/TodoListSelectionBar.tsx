"use client";

import texts from "./locales/ja.json";

export type TodoListSelectionBarProps = {
  selectedCount: number;
  onCutAction: () => void;
  onClearSelectionAction: () => void;
};

/**
 * 選択中アイテムのアクションバー。
 * 選択件数・切り取り・選択解除を担当する。
 */
export const TodoListSelectionBar = ({
  selectedCount,
  onCutAction,
  onClearSelectionAction,
}: TodoListSelectionBarProps) => (
  <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-xl">
    <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
      {texts.list.selectedCount.replace("{count}", String(selectedCount))}
    </span>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onClearSelectionAction}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        {texts.list.clearSelectionButton}
      </button>
      <button
        type="button"
        onClick={onCutAction}
        className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
      >
        ✂️ {texts.list.cutButton}
      </button>
    </div>
  </div>
);
