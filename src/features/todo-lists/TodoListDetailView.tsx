"use client";

import { CardPanel } from "@/components";
import type { TodoItemBgColorValue, TodoList, TodoListItem } from "./types";
import { TodoListHeader } from "./TodoListHeader";
import { TodoListProgressBar } from "./TodoListProgressBar";
import { TodoListToolbar } from "./TodoListToolbar";
import { TodoListSelectionBar } from "./TodoListSelectionBar";
import { TodoListClipboardBar } from "./TodoListClipboardBar";
import { TodoListAddForm } from "./TodoListAddForm";
import { TodoListSortableItems } from "./TodoListSortableItems";
import { useCallback, useEffect } from "react";
import {
  useTodoListDetailViewState,
} from "./useTodoListDetailViewState";
import { useTodoListDetailSelection } from "./useTodoListDetailSelection";
import { useColorPickerController } from "./useColorPickerController";
import { useMobileActionMenuController } from "./useMobileActionMenuController";
import { useTodoListDragAndDrop } from "./useTodoListDragAndDrop";
import { useTodoListInlineInsert } from "./useTodoListInlineInsert";

export type TodoListDetailViewProps = {
  list: TodoList;
  clipboardItems: TodoListItem[];
  onAddItem: (listId: string, title: string, insertAfterIndex?: number) => void;
  onToggleItem: (listId: string, itemId: string) => void;
  onDeleteItem: (listId: string, itemId: string, title: string) => void;
  onDeleteList: (list: TodoList) => void;
  onIndentItem: (listId: string, itemId: string) => void;
  onOutdentItem: (listId: string, itemId: string) => void;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
  onUpdateListTitle: (listId: string, title: string) => void;
  onUpdateItemBgColor: (
    listId: string,
    itemId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateAllItemsBgColor: (
    listId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onCutItems: (listId: string, itemIds: ReadonlySet<string>) => TodoListItem[];
  onPasteItems: (listId: string, items: TodoListItem[]) => void;
  onSetClipboard: (items: TodoListItem[]) => void;
  onClearClipboard: () => void;
  onUpdateListAddItemPosition: (listId: string, position: "last" | "first") => void;
};

/**
 * Todo リスト詳細ビュー。
 * 各サブコンポーネントと hooks を組み合わせるコーディネーター。
 */
export const TodoListDetailView = ({
  list,
  clipboardItems,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onDeleteList,
  onIndentItem,
  onOutdentItem,
  onReorderItems,
  onUpdateItemTitle,
  onUpdateListTitle,
  onUpdateItemBgColor,
  onUpdateAllItemsBgColor,
  onCutItems,
  onPasteItems,
  onSetClipboard,
  onClearClipboard,
  onUpdateListAddItemPosition,
}: TodoListDetailViewProps) => {
  const {
    selectedItemIds,
    toggleSelectItem,
    clearSelection,
    hasSelection,
    handleCut,
    handlePaste,
  } = useTodoListDetailSelection({
    listId: list.id,
    clipboardItems,
    onCutItems,
    onPasteItems,
    onSetClipboard,
    onClearClipboard,
  });

  const hasClipboard = clipboardItems.length > 0;
  const {
    collapsedItemIds,
    editingItemId,
    editingItemTitle,
    editingListTitle,
    editingListTitleValue,
    hideCompleted,
    moveCompletedToBottom,
    inputRef,
    inputText,
    listTitleInputRef,
    progress: { completed, total, percentage },
    visibleItems,
    setEditingItemTitle,
    setEditingListTitleValue,
    setInputText,
    cancelEditItem,
    cancelEditListTitle,
    commitEditItem,
    commitEditListTitle,
    handleAdd,
    startEditItem,
    startEditListTitle,
    toggleCollapseItem,
    toggleHideCompleted,
    toggleMoveCompletedToBottom,
  } = useTodoListDetailViewState({
    list,
    onAddItem,
    onUpdateItemTitle,
    onUpdateListTitle,
  });

  const {
    colorPickerItemId,
    showBulkColorPicker,
    toggleItemColorPicker,
    closeItemColorPicker,
    toggleBulkColorPicker,
    closeBulkColorPicker,
  } = useColorPickerController();

  const {
    mobileMenuItemId,
    toggleMobileMenu,
    closeMobileMenu,
  } = useMobileActionMenuController();

  const {
    insertAfterId,
    inlineInputText,
    setInlineInputText,
    openInlineInsert,
    closeInlineInsert,
    handleInlineAdd,
  } = useTodoListInlineInsert({ listId: list.id, onAddItem });

  const {
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTodoListDragAndDrop({
    items: list.items,
    listId: list.id,
    onReorderItems,
    onDragStarted: closeInlineInsert,
    disabled: moveCompletedToBottom && !hideCompleted,
  });

  // ソートビュー有効時（かつ hideCompleted=false）は表示順とデータ順が乖離するため、既存のインライン挿入フォームを閉じる
  useEffect(() => {
    if (moveCompletedToBottom && !hideCompleted) closeInlineInsert();
  }, [moveCompletedToBottom, hideCompleted, closeInlineInsert]);

  // moveCompletedToBottom=true 時はインライン挿入を封じる安定参照の no-op
  const noOpOpenInlineInsert = useCallback(() => {}, []);

  const activeItem = list.items.find((i) => i.id === activeId) ?? null;

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <TodoListHeader
            list={list}
            editingListTitle={editingListTitle}
            editingListTitleValue={editingListTitleValue}
            listTitleInputRef={listTitleInputRef}
            onChangeListTitleValue={setEditingListTitleValue}
            onCommitEditListTitle={commitEditListTitle}
            onCancelEditListTitle={cancelEditListTitle}
            onStartEditListTitle={startEditListTitle}
            onDeleteList={onDeleteList}
          />

          <TodoListProgressBar
            completed={completed}
            total={total}
            percentage={percentage}
          />

          <TodoListToolbar
            items={list.items}
            addItemPosition={list.addItemPosition}
            hideCompleted={hideCompleted}
            moveCompletedToBottom={moveCompletedToBottom}
            showBulkColorPicker={showBulkColorPicker}
            hasCompletedItems={list.items.some((item) => item.isCompleted)}
            onToggleBulkColorPicker={toggleBulkColorPicker}
            onCloseBulkColorPicker={closeBulkColorPicker}
            onUpdateAllItemsBgColor={(bgColor) =>
              onUpdateAllItemsBgColor(list.id, bgColor)
            }
            onToggleListAddItemPosition={(nextPosition) =>
              onUpdateListAddItemPosition(list.id, nextPosition)
            }
            onToggleHideCompleted={toggleHideCompleted}
            onToggleMoveCompletedToBottom={toggleMoveCompletedToBottom}
          />

          {hasSelection && (
            <TodoListSelectionBar
              selectedCount={selectedItemIds.size}
              onCut={handleCut}
              onClearSelection={clearSelection}
            />
          )}

          {hasClipboard && !hasSelection && (
            <TodoListClipboardBar
              clipboardCount={clipboardItems.length}
              onPaste={handlePaste}
              onClearClipboard={onClearClipboard}
            />
          )}

          <TodoListSortableItems
            list={list}
            visibleItems={visibleItems}
            hideCompleted={hideCompleted}
            activeId={activeId}
            activeItem={activeItem}
            selectedItemIds={selectedItemIds}
            collapsedItemIds={collapsedItemIds}
            insertAfterId={insertAfterId}
            inlineInputText={inlineInputText}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            onSetInlineInputText={setInlineInputText}
            onHandleInlineAdd={handleInlineAdd}
            onCloseInlineInsert={closeInlineInsert}
            onOpenInlineInsert={(moveCompletedToBottom && !hideCompleted) ? noOpOpenInlineInsert : openInlineInsert}
            editingItemId={editingItemId}
            editingItemTitle={editingItemTitle}
            setEditingItemTitle={setEditingItemTitle}
            commitEditItem={commitEditItem}
            cancelEditItem={cancelEditItem}
            startEditItem={startEditItem}
            toggleSelectItem={toggleSelectItem}
            toggleCollapseItem={toggleCollapseItem}
            colorPickerItemId={colorPickerItemId}
            toggleItemColorPicker={toggleItemColorPicker}
            closeItemColorPicker={closeItemColorPicker}
            onUpdateItemBgColor={onUpdateItemBgColor}
            onToggleItem={onToggleItem}
            onDeleteItem={onDeleteItem}
            onIndentItem={onIndentItem}
            onOutdentItem={onOutdentItem}
            mobileMenuItemId={mobileMenuItemId}
            toggleMobileMenu={toggleMobileMenu}
            closeMobileMenu={closeMobileMenu}
          />

          <TodoListAddForm
            inputRef={inputRef}
            inputText={inputText}
            onChangeText={setInputText}
            onAdd={handleAdd}
          />
        </CardPanel>
      </main>
    </div>
  );
};
