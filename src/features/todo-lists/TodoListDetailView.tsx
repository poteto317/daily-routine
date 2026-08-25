"use client";

import { CardPanel } from "@/components";
import type { ReactNode } from "react";
import type {
  TodoCategory,
  TodoItemBgColorValue,
  TodoList,
  TodoListItem,
} from "./types";
import { TodoListHeader } from "./TodoListHeader";
import { TodoListProgressBar } from "./TodoListProgressBar";
import { TodoListToolbar } from "./TodoListToolbar";
import { TodoListActionStatusBar } from "./TodoListActionStatusBar";
import { TodoListAddForm } from "./TodoListAddForm";
import { TodoListSortableItems } from "./TodoListSortableItems";
import { useTodoListDetailViewComposition } from "./useTodoListDetailViewComposition";

export type TodoListDetailViewProps = {
  list: TodoList;
  categories: TodoCategory[];
  clipboardItems: TodoListItem[];
  onAddItemAction: (
    listId: string,
    title: string,
    insertAfterIndex?: number,
  ) => void;
  onToggleItemAction: (listId: string, itemId: string) => void;
  onDeleteItemAction: (listId: string, itemId: string, title: string) => void;
  onIndentItemAction: (listId: string, itemId: string) => void;
  onOutdentItemAction: (listId: string, itemId: string) => void;
  onReorderItemsAction: (
    listId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onUpdateItemTitleAction: (
    listId: string,
    itemId: string,
    title: string,
  ) => void;
  onUpdateListTitleAction: (listId: string, title: string) => void;
  onUpdateItemBgColorAction: (
    listId: string,
    itemId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateAllItemsBgColorAction: (
    listId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onCutItemsAction: (
    listId: string,
    itemIds: ReadonlySet<string>,
  ) => TodoListItem[];
  onPasteItemsAction: (listId: string, items: TodoListItem[]) => void;
  onSetClipboardAction: (items: TodoListItem[]) => void;
  onClearClipboardAction: () => void;
  onUpdateListAddItemPositionAction: (
    listId: string,
    position: "last" | "first",
  ) => void;
  onUpdateListHideCompletedAction: (
    listId: string,
    hideCompleted: boolean,
  ) => void;
  onUpdateItemCategoryAction: (
    listId: string,
    itemId: string,
    categoryId: string | undefined,
  ) => void;
  historyControls?: ReactNode;
};

export const TodoListDetailView = ({
  list,
  categories,
  clipboardItems,
  onAddItemAction,
  onToggleItemAction,
  onDeleteItemAction,
  onIndentItemAction,
  onOutdentItemAction,
  onReorderItemsAction,
  onUpdateItemTitleAction,
  onUpdateListTitleAction,
  onUpdateItemBgColorAction,
  onUpdateAllItemsBgColorAction,
  onCutItemsAction,
  onPasteItemsAction,
  onSetClipboardAction,
  onClearClipboardAction,
  onUpdateListAddItemPositionAction,
  onUpdateListHideCompletedAction,
  onUpdateItemCategoryAction,
  historyControls,
}: TodoListDetailViewProps) => {
  const {
    selection,
    hasClipboard,
    viewState,
    uiControllers,
    interactionMode,
    toolbar,
  } = useTodoListDetailViewComposition({
    list,
    categories,
    clipboardItems,
    onAddItem: onAddItemAction,
    onUpdateItemTitle: onUpdateItemTitleAction,
    onUpdateListTitle: onUpdateListTitleAction,
    onCutItems: onCutItemsAction,
    onPasteItems: onPasteItemsAction,
    onSetClipboard: onSetClipboardAction,
    onClearClipboard: onClearClipboardAction,
    onReorderItems: onReorderItemsAction,
    onUpdateAllItemsBgColor: onUpdateAllItemsBgColorAction,
    onUpdateListAddItemPosition: onUpdateListAddItemPositionAction,
    onUpdateListHideCompleted: onUpdateListHideCompletedAction,
  });

  const {
    hasSelection,
    selectedItemIds,
    toggleSelectItem: toggleSelectItemAction,
    handleCut,
    handlePaste,
    clearSelection,
  } = selection;

  const {
    hideCompleted,
    categoryLookup,
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
    setEditingItemTitle: setEditingItemTitleAction,
    setEditingListTitleValue,
    setInputText,
    cancelEditItem: cancelEditItemAction,
    cancelEditListTitle,
    commitEditItem: commitEditItemAction,
    commitEditListTitle,
    handleAdd,
    startEditItem: startEditItemAction,
    startEditListTitle,
    toggleCollapseItem: toggleCollapseItemAction,
    toggleHideCompleted,
  } = viewState;

  const {
    colorPicker: {
      showBulkColorPicker,
      toggleBulkColorPicker,
      closeBulkColorPicker,
    },
    itemMenu: {
      itemMenuItemId,
      toggleItemMenu: toggleItemMenuAction,
      closeItemMenu: closeItemMenuAction,
    },
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
    dnd: {
      activeId,
      sensors,
      handleDragStart,
      handleDragEnd,
      handleDragCancel,
    },
    activeItem,
    sortModeActive,
  } = interactionMode;

  const {
    hasCompletedItems,
    handleUpdateAllItemsBgColor,
    handleToggleAddItemPosition,
  } = toolbar;

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <TodoListHeader
            list={list}
            editingListTitle={editingListTitle}
            editingListTitleValue={editingListTitleValue}
            listTitleInputRef={listTitleInputRef}
            onChangeListTitleValueAction={setEditingListTitleValue}
            onCommitEditListTitleAction={commitEditListTitle}
            onCancelEditListTitleAction={cancelEditListTitle}
            onStartEditListTitleAction={startEditListTitle}
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
            showBulkColorPicker={showBulkColorPicker}
            hasCompletedItems={hasCompletedItems}
            onToggleBulkColorPickerAction={toggleBulkColorPicker}
            onCloseBulkColorPickerAction={closeBulkColorPicker}
            onUpdateAllItemsBgColorAction={handleUpdateAllItemsBgColor}
            onToggleListAddItemPositionAction={handleToggleAddItemPosition}
            onToggleHideCompletedAction={toggleHideCompleted}
            historyControls={historyControls}
          />

          <TodoListActionStatusBar
            hasSelection={hasSelection}
            hasClipboard={hasClipboard}
            selectedCount={selectedItemIds.size}
            clipboardCount={clipboardItems.length}
            onCutAction={handleCut}
            onClearSelectionAction={clearSelection}
            onPasteAction={handlePaste}
            onClearClipboardAction={onClearClipboardAction}
          />

          <TodoListSortableItems
            list={list}
            visibleItems={visibleItems}
            hideCompleted={hideCompleted}
            categories={categories}
            categoryLookup={categoryLookup}
            sortModeActive={sortModeActive}
            activeId={activeId}
            activeItem={activeItem}
            selectedItemIds={selectedItemIds}
            collapsedItemIds={collapsedItemIds}
            insertAfterId={insertAfterId}
            inlineInputText={inlineInputText}
            sensors={sensors}
            onDragStartAction={handleDragStart}
            onDragEndAction={handleDragEnd}
            onDragCancelAction={handleDragCancel}
            onSetInlineInputTextAction={setInlineInputText}
            onHandleInlineAddAction={handleInlineAdd}
            onCloseInlineInsertAction={closeInlineInsert}
            onOpenInlineInsertAction={openInlineInsert}
            editingItemId={editingItemId}
            editingItemTitle={editingItemTitle}
            setEditingItemTitleAction={setEditingItemTitleAction}
            commitEditItemAction={commitEditItemAction}
            cancelEditItemAction={cancelEditItemAction}
            startEditItemAction={startEditItemAction}
            toggleSelectItemAction={toggleSelectItemAction}
            toggleCollapseItemAction={toggleCollapseItemAction}
            onUpdateItemBgColorAction={onUpdateItemBgColorAction}
            onUpdateItemCategoryAction={onUpdateItemCategoryAction}
            onToggleItemAction={onToggleItemAction}
            onDeleteItemAction={onDeleteItemAction}
            onIndentItemAction={onIndentItemAction}
            onOutdentItemAction={onOutdentItemAction}
            itemMenuItemId={itemMenuItemId}
            toggleItemMenuAction={toggleItemMenuAction}
            closeItemMenuAction={closeItemMenuAction}
          />

          <TodoListAddForm
            inputRef={inputRef}
            inputText={inputText}
            onChangeTextAction={setInputText}
            onAddAction={handleAdd}
          />
        </CardPanel>
      </main>
    </div>
  );
};
