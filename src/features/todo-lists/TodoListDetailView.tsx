"use client";

import { CardPanel } from "@/components";
import type { ReactNode } from "react";
import type { TodoItemBgColorValue, TodoList, TodoListItem } from "./types";
import { TodoListHeader } from "./TodoListHeader";
import { TodoListProgressBar } from "./TodoListProgressBar";
import { TodoListToolbar } from "./TodoListToolbar";
import { TodoListActionStatusBar } from "./TodoListActionStatusBar";
import { TodoListAddForm } from "./TodoListAddForm";
import { TodoListSortableItems } from "./TodoListSortableItems";
import { useTodoListDetailViewComposition } from "./useTodoListDetailViewComposition";

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
  historyControls?: ReactNode;
};

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
  historyControls,
}: TodoListDetailViewProps) => {
  const { selection, hasClipboard, viewState, uiControllers, interactionMode, toolbar } =
    useTodoListDetailViewComposition({
      list,
      clipboardItems,
      onAddItem,
      onUpdateItemTitle,
      onUpdateListTitle,
      onCutItems,
      onPasteItems,
      onSetClipboard,
      onClearClipboard,
      onReorderItems,
      onUpdateAllItemsBgColor,
      onUpdateListAddItemPosition,
    });

  const {
    hasSelection,
    selectedItemIds,
    toggleSelectItem,
    handleCut,
    handlePaste,
    clearSelection,
  } = selection;

  const {
    hideCompleted,
    moveCompletedToBottom,
    collapsedItemIds,
    editingItemId,
    editingItemTitle,
    editingListTitle,
    editingListTitleValue,
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
  } = viewState;

  const {
    colorPicker: {
      colorPickerItemId,
      showBulkColorPicker,
      toggleItemColorPicker,
      closeItemColorPicker,
      toggleBulkColorPicker,
      closeBulkColorPicker,
    },
    mobileMenu: { mobileMenuItemId, toggleMobileMenu, closeMobileMenu },
  } = uiControllers;

  const {
    inlineInsert: {
      insertAfterId,
      inlineInputText,
      setInlineInputText,
      openInlineInsert,
      closeInlineInsert,
      handleInlineAdd,
    },
    dnd: { activeId, sensors, handleDragStart, handleDragEnd, handleDragCancel },
    activeItem,
  } = interactionMode;

  const { hasCompletedItems, handleUpdateAllItemsBgColor, handleToggleAddItemPosition } =
    toolbar;

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
            hasCompletedItems={hasCompletedItems}
            onToggleBulkColorPicker={toggleBulkColorPicker}
            onCloseBulkColorPicker={closeBulkColorPicker}
            onUpdateAllItemsBgColor={handleUpdateAllItemsBgColor}
            onToggleListAddItemPosition={handleToggleAddItemPosition}
            onToggleHideCompleted={toggleHideCompleted}
            onToggleMoveCompletedToBottom={toggleMoveCompletedToBottom}
            historyControls={historyControls}
          />

          <TodoListActionStatusBar
            hasSelection={hasSelection}
            hasClipboard={hasClipboard}
            selectedCount={selectedItemIds.size}
            clipboardCount={clipboardItems.length}
            onCut={handleCut}
            onClearSelection={clearSelection}
            onPaste={handlePaste}
            onClearClipboard={onClearClipboard}
          />

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
            onOpenInlineInsert={openInlineInsert}
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
