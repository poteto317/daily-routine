"use client";

import type { ReactNode } from "react";
import type { TodoItemBgColorValue, TodoListItem } from "./types";
import { AddItemPositionToggleButton } from "./AddItemPositionToggleButton";
import { TodoListBulkColorPicker } from "./TodoListBulkColorPicker";
import { TodoListCompletedVisibilityControls } from "./TodoListCompletedVisibilityControls";
import { TodoListCategoryGroupingControls } from "./TodoListCategoryGroupingControls";

export type TodoListToolbarProps = {
  items: TodoListItem[];
  addItemPosition: "first" | "last" | undefined;
  hideCompleted: boolean;
  moveCompletedToBottom: boolean;
  showBulkColorPicker: boolean;
  hasCompletedItems: boolean;
  hasCategories: boolean;
  groupByCategory: boolean;
  onToggleBulkColorPicker: () => void;
  onCloseBulkColorPicker: () => void;
  onUpdateAllItemsBgColor: (
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onToggleListAddItemPosition: (nextPosition: "first" | "last") => void;
  onToggleHideCompleted: () => void;
  onToggleMoveCompletedToBottom: () => void;
  onToggleGroupByCategory: () => void;
  historyControls?: ReactNode;
};

export const TodoListToolbar = ({
  items,
  addItemPosition,
  hideCompleted,
  moveCompletedToBottom,
  showBulkColorPicker,
  hasCompletedItems,
  hasCategories,
  groupByCategory,
  onToggleBulkColorPicker,
  onCloseBulkColorPicker,
  onUpdateAllItemsBgColor,
  onToggleListAddItemPosition,
  onToggleHideCompleted,
  onToggleMoveCompletedToBottom,
  onToggleGroupByCategory,
  historyControls,
}: TodoListToolbarProps) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <TodoListBulkColorPicker
        items={items}
        showBulkColorPicker={showBulkColorPicker}
        onToggle={onToggleBulkColorPicker}
        onClose={onCloseBulkColorPicker}
        onUpdateAllItemsBgColor={onUpdateAllItemsBgColor}
      />
      {historyControls}
    </div>
    <div className="flex items-center gap-3">
      <AddItemPositionToggleButton
        addItemPosition={addItemPosition}
        onToggle={onToggleListAddItemPosition}
      />
      <TodoListCategoryGroupingControls
        hasCategories={hasCategories}
        groupByCategory={groupByCategory}
        onToggleGroupByCategory={onToggleGroupByCategory}
      />
      <TodoListCompletedVisibilityControls
        hasCompletedItems={hasCompletedItems}
        hideCompleted={hideCompleted}
        moveCompletedToBottom={moveCompletedToBottom}
        onToggleHideCompleted={onToggleHideCompleted}
        onToggleMoveCompletedToBottom={onToggleMoveCompletedToBottom}
      />
    </div>
  </div>
);
