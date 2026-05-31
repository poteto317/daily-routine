"use client";

import type { TodoItemBgColorValue, TodoListItem } from "./types";
import { AddItemPositionToggleButton } from "./AddItemPositionToggleButton";
import { TodoListBulkColorPicker } from "./TodoListBulkColorPicker";
import texts from "./locales/ja.json";

export type TodoListToolbarProps = {
  items: TodoListItem[];
  addItemPosition: "first" | "last" | undefined;
  hideCompleted: boolean;
  showBulkColorPicker: boolean;
  hasCompletedItems: boolean;
  onToggleBulkColorPicker: () => void;
  onCloseBulkColorPicker: () => void;
  onUpdateAllItemsBgColor: (
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onToggleListAddItemPosition: (nextPosition: "first" | "last") => void;
  onToggleHideCompleted: () => void;
};

/**
 * Todo リストのツールバー。
 * 一括背景色ピッカー・追加位置トグル・完了済み表示トグルを担当する。
 */
export const TodoListToolbar = ({
  items,
  addItemPosition,
  hideCompleted,
  showBulkColorPicker,
  hasCompletedItems,
  onToggleBulkColorPicker,
  onCloseBulkColorPicker,
  onUpdateAllItemsBgColor,
  onToggleListAddItemPosition,
  onToggleHideCompleted,
}: TodoListToolbarProps) => (
  <div className="mb-4 flex items-center justify-between">
    <TodoListBulkColorPicker
      items={items}
      showBulkColorPicker={showBulkColorPicker}
      onToggle={onToggleBulkColorPicker}
      onClose={onCloseBulkColorPicker}
      onUpdateAllItemsBgColor={onUpdateAllItemsBgColor}
    />
    <div className="flex items-center gap-3">
      <AddItemPositionToggleButton
        addItemPosition={addItemPosition}
        onToggle={onToggleListAddItemPosition}
      />
      {hasCompletedItems && (
        <button
          type="button"
          onClick={onToggleHideCompleted}
          className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
        >
          {hideCompleted
            ? texts.list.showCompleted
            : texts.list.hideCompleted}
        </button>
      )}
    </div>
  </div>
);
