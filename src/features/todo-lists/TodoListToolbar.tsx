"use client";

import type { ReactNode } from "react";
import type { TodoItemBgColorValue, TodoListItem } from "./types";
import { AddItemPositionToggleButton } from "./AddItemPositionToggleButton";
import { TodoListBulkColorPicker } from "./TodoListBulkColorPicker";
import { TodoListCompletedVisibilityControls } from "./TodoListCompletedVisibilityControls";

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
  historyControls?: ReactNode;
};

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
      <TodoListCompletedVisibilityControls
        hasCompletedItems={hasCompletedItems}
        hideCompleted={hideCompleted}
        onToggleHideCompleted={onToggleHideCompleted}
      />
    </div>
  </div>
);
