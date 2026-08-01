"use client";

import type { TodoItemBgColorValue, TodoListItem } from "./types";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";

export type TodoListBulkColorPickerProps = {
  items: TodoListItem[];
  showBulkColorPicker: boolean;
  onToggleAction: () => void;
  onCloseAction: () => void;
  onUpdateAllItemsBgColorAction: (bgColor: TodoItemBgColorValue | undefined) => void;
};

/**
 * ツールバー上の一括背景色ピッカー。
 * 全アイテムが同一色なら選択状態を示し、混在なら未選択扱い（null）にする。
 */
export const TodoListBulkColorPicker = ({
  items,
  showBulkColorPicker,
  onToggleAction,
  onCloseAction,
  onUpdateAllItemsBgColorAction,
}: TodoListBulkColorPickerProps) => {
  const bgColors = items.map((i) => i.bgColor);
  // null = 混在（どのスウォッチも選択中にしない）
  // undefined = 全アイテムがデフォルト色
  const bulkSelected: TodoItemBgColorValue | undefined | null =
    bgColors.length > 0 && bgColors.every((c) => c === bgColors[0])
      ? bgColors[0]
      : null;

  return (
    <div className="relative" data-color-picker>
      <button
        type="button"
        onClick={onToggleAction}
        className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
        aria-label="一括背景色変更"
        aria-expanded={showBulkColorPicker}
      >
        🎨 一括背景色
      </button>
      {showBulkColorPicker && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex gap-1.5">
          <TodoItemColorSwatches
            selectedColor={bulkSelected}
            showDefaultBorder
            onSelectAction={(color) => {
              onUpdateAllItemsBgColorAction(color);
              onCloseAction();
            }}
          />
        </div>
      )}
    </div>
  );
};
