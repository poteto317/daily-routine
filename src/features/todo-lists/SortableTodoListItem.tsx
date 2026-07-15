"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import type { TodoItemBgColorValue, TodoList, TodoListItem } from "./types";
import { getTodoItemBgClass } from "./todoItemBgColor";
import { getItemIndentLevel } from "./todoListItemIndentLevel";
import { getMaxAllowedIndent } from "./todoListItemMaxIndent";
import { TodoItemTitleArea } from "./TodoItemTitleArea";
import { TodoItemDesktopActions } from "./TodoItemDesktopActions";
import {
  TodoItemMobileTrigger,
  TodoItemMobileDropdown,
} from "./TodoItemMobileMenu";
import { TodoItemIndentButtons } from "./TodoItemIndentButtons";
import { TodoItemSelectCheckbox } from "./TodoItemSelectCheckbox";
import { TodoItemDragHandle } from "./TodoItemDragHandle";
import { TodoItemCollapseButton } from "./TodoItemCollapseButton";
import { TodoItemCompleteButton } from "./TodoItemCompleteButton";

export type SortableTodoListItemProps = {
  item: TodoListItem;
  list: TodoList;
  origIndex: number;
  isDragActive: boolean;
  editingItemId: string | null;
  editingItemTitle: string;
  setEditingItemTitle: (v: string) => void;
  commitEditItem: (id: string) => void;
  cancelEditItem: () => void;
  startEditItem: (id: string, title: string) => void;
  isSelected: boolean;
  toggleSelectItem: (id: string) => void;
  isParent: boolean;
  isCollapsed: boolean;
  toggleCollapseItem: (id: string) => void;
  colorPickerItemId: string | null;
  toggleItemColorPicker: (id: string) => void;
  closeItemColorPicker: () => void;
  onUpdateItemBgColor: (
    listId: string,
    itemId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onToggleItem: (listId: string, itemId: string) => void;
  onDeleteItem: (listId: string, itemId: string, title: string) => void;
  onIndentItem: (listId: string, itemId: string) => void;
  onOutdentItem: (listId: string, itemId: string) => void;
  isInlineInsertOpen: boolean;
  onInsertAfter: () => void;
  mobileMenuItemId: string | null;
  toggleMobileMenu: (id: string) => void;
  closeMobileMenu: () => void;
};

/**
 * dnd-kit でソート可能な個別 Todo アイテム。
 * 各サブコンポーネントを組み合わせるコーディネーター。
 */
export const SortableTodoListItem = ({
  item,
  list,
  origIndex,
  isDragActive,
  editingItemId,
  editingItemTitle,
  setEditingItemTitle,
  commitEditItem,
  cancelEditItem,
  startEditItem,
  isSelected,
  toggleSelectItem,
  isParent,
  isCollapsed,
  toggleCollapseItem,
  colorPickerItemId,
  toggleItemColorPicker,
  closeItemColorPicker,
  onUpdateItemBgColor,
  onToggleItem,
  onDeleteItem,
  onIndentItem,
  onOutdentItem,
  isInlineInsertOpen,
  onInsertAfter,
  mobileMenuItemId,
  toggleMobileMenu,
  closeMobileMenu,
}: SortableTodoListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const currentIndent = getItemIndentLevel(item);
  const maxIndent = getMaxAllowedIndent(list.items, origIndex);
  const canSwipeIndent = editingItemId !== item.id && currentIndent < maxIndent;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        marginLeft: `${currentIndent * 20}px`,
        touchAction: "pan-y",
      }}
      className="group relative"
    >
      <SwipeableRoutineItem
        onSwipeAction={() => onIndentItem(list.id, item.id)}
        swipeActionType="indent"
        isEditMode={canSwipeIndent}
      >
        <div
          className={`flex items-center gap-2 p-3 border rounded-xl hover:shadow-sm transition-shadow ${
            isDragging
              ? `${getTodoItemBgClass(item.bgColor)} border-teal-400 dark:border-teal-500 shadow-md`
              : isSelected
                ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-400"
                : `${getTodoItemBgClass(item.bgColor)} border-gray-100 dark:border-gray-500`
          }`}
        >
          <TodoItemSelectCheckbox
            itemId={item.id}
            title={item.title}
            isSelected={isSelected}
            onToggleSelect={toggleSelectItem}
          />

          <TodoItemDragHandle attributes={attributes} listeners={listeners} />

          <TodoItemIndentButtons
            listId={list.id}
            itemId={item.id}
            currentIndent={currentIndent}
            maxIndent={maxIndent}
            onIndent={onIndentItem}
            onOutdent={onOutdentItem}
          />

          <TodoItemCollapseButton
            itemId={item.id}
            isParent={isParent}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapseItem}
          />

          <TodoItemCompleteButton
            listId={list.id}
            itemId={item.id}
            isCompleted={item.isCompleted}
            isDragActive={isDragActive}
            onToggle={onToggleItem}
          />

          <TodoItemTitleArea
            itemId={item.id}
            title={item.title}
            isCompleted={item.isCompleted}
            isEditing={editingItemId === item.id}
            editingTitle={editingItemTitle}
            isDragActive={isDragActive}
            onChangeTitle={setEditingItemTitle}
            onCommitEdit={() => commitEditItem(item.id)}
            onCancelEdit={cancelEditItem}
            onToggle={() => onToggleItem(list.id, item.id)}
          />

          {editingItemId !== item.id && (
            <>
              <TodoItemDesktopActions
                item={item}
                listId={list.id}
                colorPickerItemId={colorPickerItemId}
                isInlineInsertOpen={isInlineInsertOpen}
                toggleItemColorPicker={toggleItemColorPicker}
                closeItemColorPicker={closeItemColorPicker}
                onUpdateItemBgColor={onUpdateItemBgColor}
                startEditItem={startEditItem}
                onDeleteItem={onDeleteItem}
                onInsertAfter={onInsertAfter}
              />
              <TodoItemMobileTrigger
                item={item}
                mobileMenuItemId={mobileMenuItemId}
                toggleMobileMenu={toggleMobileMenu}
              />
            </>
          )}
        </div>
      </SwipeableRoutineItem>

      {/* モバイルドロップダウン — SwipeableRoutineItem の overflow-hidden 外に配置 */}
      <TodoItemMobileDropdown
        item={item}
        listId={list.id}
        currentIndent={currentIndent}
        maxIndent={maxIndent}
        mobileMenuItemId={mobileMenuItemId}
        closeMobileMenu={closeMobileMenu}
        startEditItem={startEditItem}
        onInsertAfter={onInsertAfter}
        onOutdentItem={onOutdentItem}
        onIndentItem={onIndentItem}
        onUpdateItemBgColor={onUpdateItemBgColor}
        onDeleteItem={onDeleteItem}
      />
    </li>
  );
};
