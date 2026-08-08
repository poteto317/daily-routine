"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import type {
  TodoCategory,
  TodoItemBgColorValue,
  TodoList,
  TodoListItem,
} from "./types";
import { getTodoItemBgClass } from "./todoItemBgColor";
import { resolveTodoItemDisplayBgColor } from "./todoCategoryLookup";
import { getItemIndentLevel } from "./todoListItemIndentLevel";
import { getMaxAllowedIndent } from "./todoListItemMaxIndent";
import { TodoItemTitleArea } from "./TodoItemTitleArea";
import {
  TodoItemActionMenuTrigger,
  TodoItemActionMenuDropdown,
} from "./TodoItemActionMenu";
import { TodoItemIndentButtons } from "./TodoItemIndentButtons";
import { TodoItemDragHandle } from "./TodoItemDragHandle";
import { TodoItemCollapseButton } from "./TodoItemCollapseButton";

export type SortableTodoListItemProps = {
  item: TodoListItem;
  list: TodoList;
  origIndex: number;
  isBlockAnchor: boolean;
  categories: TodoCategory[];
  categoryLookup: Map<string, TodoCategory>;
  sortModeActive: boolean;
  isDragActive: boolean;
  editingItemId: string | null;
  editingItemTitle: string;
  setEditingItemTitleAction: (v: string) => void;
  commitEditItemAction: (id: string) => void;
  cancelEditItemAction: () => void;
  startEditItemAction: (id: string, title: string) => void;
  isSelected: boolean;
  toggleSelectItemAction: (id: string) => void;
  isParent: boolean;
  isCollapsed: boolean;
  toggleCollapseItemAction: (id: string) => void;
  onUpdateItemBgColorAction: (
    listId: string,
    itemId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateItemCategoryAction: (
    listId: string,
    itemId: string,
    categoryId: string | undefined,
  ) => void;
  onToggleItemAction: (listId: string, itemId: string) => void;
  onDeleteItemAction: (listId: string, itemId: string, title: string) => void;
  onIndentItemAction: (listId: string, itemId: string) => void;
  onOutdentItemAction: (listId: string, itemId: string) => void;
  onInsertAfterAction: () => void;
  itemMenuItemId: string | null;
  toggleItemMenuAction: (id: string) => void;
  closeItemMenuAction: () => void;
};

/**
 * dnd-kit でソート可能な個別 Todo アイテム。
 * 各サブコンポーネントを組み合わせるコーディネーター。
 */
export const SortableTodoListItem = ({
  item,
  list,
  origIndex,
  isBlockAnchor,
  categories,
  categoryLookup,
  sortModeActive,
  isDragActive,
  editingItemId,
  editingItemTitle,
  setEditingItemTitleAction,
  commitEditItemAction,
  cancelEditItemAction,
  startEditItemAction,
  isSelected,
  toggleSelectItemAction,
  isParent,
  isCollapsed,
  toggleCollapseItemAction,
  onUpdateItemBgColorAction,
  onUpdateItemCategoryAction,
  onToggleItemAction,
  onDeleteItemAction,
  onIndentItemAction,
  onOutdentItemAction,
  onInsertAfterAction,
  itemMenuItemId,
  toggleItemMenuAction,
  closeItemMenuAction,
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
  // sortModeActive中はスワイプによるインデント変更も、生配列の隣接関係が
  // 画面表示と乖離した状態で「直前のアイテムの子にする」操作になりうるため、
  // DnDと同じ理由で封じる（useTodoListInteractionMode.ts参照）。
  const canSwipeIndent =
    editingItemId !== item.id && currentIndent < maxIndent && !sortModeActive;
  const displayBgColor = resolveTodoItemDisplayBgColor(categoryLookup, item);

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
        onSwipeAction={() => onIndentItemAction(list.id, item.id)}
        swipeActionType="indent"
        isEditMode={canSwipeIndent}
      >
        <div
          className={`flex items-center gap-2 p-3 border rounded-xl hover:shadow-sm transition-shadow ${
            isDragging
              ? `${getTodoItemBgClass(displayBgColor)} border-teal-400 dark:border-teal-500 shadow-md`
              : isSelected
                ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-400"
                : `${getTodoItemBgClass(displayBgColor)} border-gray-100 dark:border-gray-500`
          }`}
        >
          {/* 並び替え（DnD）はブロックのアンカー同士でのみ許可される
              （todoListItemReorderAction.ts参照）。アンカーでないアイテム
              （他アイテムの子孫）は並び替えの起点・着地点として常に拒否
              されるため、機能しない掴みハンドルを見せると操作可能と
              誤認させる。isBlockAnchorはtodoListItemReorderAction.tsと同じ
              getBlockAnchorIndices（todoListItemBlocks.ts）を単一の判定
              根拠として使っており、判定基準が乖離することはない。 */}
          {isBlockAnchor && (
            <TodoItemDragHandle attributes={attributes} listeners={listeners} />
          )}

          <TodoItemIndentButtons
            listId={list.id}
            itemId={item.id}
            currentIndent={currentIndent}
            maxIndent={maxIndent}
            sortModeActive={sortModeActive}
            onIndentAction={onIndentItemAction}
            onOutdentAction={onOutdentItemAction}
          />

          <TodoItemCollapseButton
            itemId={item.id}
            isParent={isParent}
            isCollapsed={isCollapsed}
            onToggleCollapseAction={toggleCollapseItemAction}
          />

          <TodoItemTitleArea
            itemId={item.id}
            title={item.title}
            isCompleted={item.isCompleted}
            isEditing={editingItemId === item.id}
            editingTitle={editingItemTitle}
            isDragActive={isDragActive}
            isSelected={isSelected}
            onChangeTitleAction={setEditingItemTitleAction}
            onCommitEditAction={() => commitEditItemAction(item.id)}
            onCancelEditAction={cancelEditItemAction}
            onToggleAction={() => onToggleItemAction(list.id, item.id)}
            onLongPressAction={() => toggleSelectItemAction(item.id)}
          />

          {editingItemId !== item.id && (
            <TodoItemActionMenuTrigger
              item={item}
              itemMenuItemId={itemMenuItemId}
              toggleItemMenuAction={toggleItemMenuAction}
            />
          )}
        </div>
      </SwipeableRoutineItem>

      {/* アクションメニュードロップダウン — SwipeableRoutineItem の overflow-hidden 外に配置 */}
      <TodoItemActionMenuDropdown
        item={item}
        listId={list.id}
        categories={categories}
        currentIndent={currentIndent}
        maxIndent={maxIndent}
        sortModeActive={sortModeActive}
        itemMenuItemId={itemMenuItemId}
        closeItemMenuAction={closeItemMenuAction}
        startEditItemAction={startEditItemAction}
        onInsertAfterAction={onInsertAfterAction}
        onOutdentItemAction={onOutdentItemAction}
        onIndentItemAction={onIndentItemAction}
        onUpdateItemBgColorAction={onUpdateItemBgColorAction}
        onUpdateItemCategoryAction={onUpdateItemCategoryAction}
        onDeleteItemAction={onDeleteItemAction}
      />
    </li>
  );
};
