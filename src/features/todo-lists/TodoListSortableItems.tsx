"use client";

import { Fragment } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TodoCategory, TodoList, TodoListItem } from "./types";
import { getTodoItemBgClass } from "./todoItemBgColor";
import { resolveTodoItemDisplayBgColor } from "./todoCategoryLookup";
import { filterIncompleteItems } from "./todoListIncompleteItemsFilter";
import { hasChildren } from "./todoListItemHasChildren";
import { getBlockAnchorIndices } from "./todoListItemBlocks";
import { InlineInsertForm } from "./InlineInsertForm";
import { SortableTodoListItem } from "./SortableTodoListItem";
import type { SortableTodoListItemProps } from "./SortableTodoListItem";
import texts from "./locales/ja.json";

/** `SortableTodoListItem` に渡すコールバック群 */
type ItemHandlers = Omit<
  SortableTodoListItemProps,
  | "item"
  | "list"
  | "origIndex"
  | "isBlockAnchor"
  | "categoryLookup"
  | "sortModeActive"
  | "isDragActive"
  | "isSelected"
  | "isParent"
  | "isCollapsed"
  | "isInlineInsertOpen"
  | "onInsertAfter"
>;

export type TodoListSortableItemsProps = {
  list: TodoList;
  visibleItems: TodoListItem[];
  hideCompleted: boolean;
  categoryLookup: Map<string, TodoCategory>;
  sortModeActive: boolean;
  activeId: string | null;
  activeItem: TodoListItem | null;
  selectedItemIds: ReadonlySet<string>;
  collapsedItemIds: ReadonlySet<string>;
  insertAfterId: string | null;
  inlineInputText: string;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  onSetInlineInputText: (text: string) => void;
  onHandleInlineAdd: (origIndex: number) => void;
  onCloseInlineInsert: () => void;
  onOpenInlineInsert: (itemId: string) => void;
} & ItemHandlers;

/**
 * DnD コンテキストとソートアイテム一覧。
 * アイテムが空のときはメッセージを表示する。
 */
export const TodoListSortableItems = ({
  list,
  visibleItems,
  hideCompleted,
  categoryLookup,
  sortModeActive,
  activeId,
  activeItem,
  selectedItemIds,
  collapsedItemIds,
  insertAfterId,
  inlineInputText,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onSetInlineInputText,
  onHandleInlineAdd,
  onCloseInlineInsert,
  onOpenInlineInsert,
  ...itemHandlers
}: TodoListSortableItemsProps) => {
  const itemsForParentDetection = hideCompleted
    ? filterIncompleteItems(list.items)
    : list.items;

  const itemIndexById = new Map(
    list.items.map((item, index) => [item.id, index]),
  );
  const parentDetectionIndexById = new Map(
    itemsForParentDetection.map((item, index) => [item.id, index]),
  );
  const blockAnchorIndices = getBlockAnchorIndices(list.items);

  if (visibleItems.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500">
        <p className="text-3xl mb-2">✅</p>
        <p className="text-sm font-medium">
          {list.items.length === 0
            ? texts.list.emptyMessage
            : "完了済みのみです"}
        </p>
        {list.items.length === 0 && (
          <p className="text-xs mt-1">{texts.list.emptyDescription}</p>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext
        items={visibleItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2 mb-6 [overflow-anchor:none]">
          {visibleItems.map((item) => {
            const origIndex = itemIndexById.get(item.id);
            if (origIndex === undefined) return null;

            const parentDetectionIndex = parentDetectionIndexById.get(item.id);
            const isParent =
              parentDetectionIndex !== undefined &&
              hasChildren(itemsForParentDetection, parentDetectionIndex);
            const isCollapsed = collapsedItemIds.has(item.id);
            const isSelected = selectedItemIds.has(item.id);

            return (
              <Fragment key={item.id}>
                <SortableTodoListItem
                  {...itemHandlers}
                  item={item}
                  list={list}
                  origIndex={origIndex}
                  isBlockAnchor={blockAnchorIndices.has(origIndex)}
                  categoryLookup={categoryLookup}
                  sortModeActive={sortModeActive}
                  isDragActive={activeId !== null}
                  isSelected={isSelected}
                  isParent={isParent}
                  isCollapsed={isCollapsed}
                  isInlineInsertOpen={insertAfterId === item.id}
                  onInsertAfter={() => onOpenInlineInsert(item.id)}
                />
                {insertAfterId === item.id && (
                  <InlineInsertForm
                    inputText={inlineInputText}
                    onChangeText={onSetInlineInputText}
                    onAdd={() => onHandleInlineAdd(origIndex)}
                    onCancel={onCloseInlineInsert}
                  />
                )}
              </Fragment>
            );
          })}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div
            className={`p-3 ${getTodoItemBgClass(resolveTodoItemDisplayBgColor(categoryLookup, activeItem))} border border-teal-400 dark:border-teal-500 rounded-xl shadow-lg text-sm text-gray-800 dark:text-gray-100 opacity-90 cursor-grabbing`}
          >
            {activeItem.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
