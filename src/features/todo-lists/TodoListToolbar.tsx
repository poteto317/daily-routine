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
  onToggleBulkColorPickerAction: () => void;
  onCloseBulkColorPickerAction: () => void;
  onUpdateAllItemsBgColorAction: (
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onToggleListAddItemPositionAction: (nextPosition: "first" | "last") => void;
  onToggleHideCompletedAction: () => void;
  historyControls?: ReactNode;
};

export const TodoListToolbar = ({
  items,
  addItemPosition,
  hideCompleted,
  showBulkColorPicker,
  hasCompletedItems,
  onToggleBulkColorPickerAction,
  onCloseBulkColorPickerAction,
  onUpdateAllItemsBgColorAction,
  onToggleListAddItemPositionAction,
  onToggleHideCompletedAction,
  historyControls,
}: TodoListToolbarProps) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <TodoListBulkColorPicker
        items={items}
        showBulkColorPicker={showBulkColorPicker}
        onToggleAction={onToggleBulkColorPickerAction}
        onCloseAction={onCloseBulkColorPickerAction}
        onUpdateAllItemsBgColorAction={onUpdateAllItemsBgColorAction}
      />
      {historyControls}
    </div>
    <div className="flex items-center gap-3">
      <AddItemPositionToggleButton
        addItemPosition={addItemPosition}
        onToggleAction={onToggleListAddItemPositionAction}
      />
      <TodoListCompletedVisibilityControls
        hasCompletedItems={hasCompletedItems}
        hideCompleted={hideCompleted}
        onToggleHideCompletedAction={onToggleHideCompletedAction}
      />
    </div>
  </div>
);
