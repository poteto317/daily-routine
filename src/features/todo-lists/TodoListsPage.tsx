"use client";

import { Fragment } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardPanel } from "@/components";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { TodoItemBgColorValue, TodoList, TodoListItem } from "./types";
import { TODO_ITEM_BG_COLORS, getTodoItemBgClass } from "./todoItemBgColor";
import { filterIncompleteItems } from "./todoListIncompleteItemsFilter";
import { hasChildren } from "./todoListItemHasChildren";
import { getItemIndentLevel } from "./todoListItemIndentLevel";
import { getMaxAllowedIndent } from "./todoListItemMaxIndent";
import {
  useTodoListDetailState,
  useTodoListSelectionState,
} from "./useTodoListsPageState";
import { useTodoListDetailViewState } from "./useTodoListDetailViewState";
import { useTodoListDetailSelection } from "./useTodoListDetailSelection";
import { useTodoListDetailClipboard } from "./useTodoListDetailClipboard";
import { useColorPickerController } from "./useColorPickerController";
import { useMobileActionMenuController } from "./useMobileActionMenuController";
import { useTodoListDragAndDrop } from "./useTodoListDragAndDrop";
import { useTodoListInlineInsert } from "./useTodoListInlineInsert";
import texts from "./locales/ja.json";

// ============================================================
// インライン挿入フォーム（アイテムの直後に表示）
// ============================================================
type InlineInsertFormProps = {
  inputText: string;
  onChangeText: (text: string) => void;
  onAdd: () => void;
  onCancel: () => void;
};

const InlineInsertForm = ({
  inputText,
  onChangeText,
  onAdd,
  onCancel,
}: InlineInsertFormProps) => (
  <li>
    <div
      role="form"
      aria-label="アイテムを挿入"
      className="flex gap-2 py-1.5 pl-2"
    >
      <input
        type="text"
        autoFocus
        aria-label={texts.list.itemPlaceholder}
        value={inputText}
        onChange={(e) => onChangeText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
            onAdd();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        placeholder={texts.list.itemPlaceholder}
        className="flex-1 text-sm px-3 py-1.5 border border-teal-300 dark:border-teal-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!inputText.trim()}
        className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
      >
        {texts.list.addButton}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 px-2 transition-colors"
        aria-label="キャンセル"
      >
        ✕
      </button>
    </div>
  </li>
);

// ============================================================
// ソート可能な個別 Todo アイテム（dnd-kit + 全機能版）
// ============================================================
type SortableTodoListItemProps = {
  item: TodoListItem;
  list: TodoList;
  origIndex: number;
  hideCompleted: boolean;
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

const SortableTodoListItem = ({
  item,
  list,
  origIndex,
  hideCompleted,
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
  } = useSortable({ id: item.id, disabled: hideCompleted });

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
          <button
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={texts.list.selectItemLabel.replace(
              "{title}",
              item.title,
            )}
            onClick={() => toggleSelectItem(item.id)}
            className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-teal-500 border-teal-500"
                : "border-gray-300 dark:border-gray-400 hover:border-teal-400"
            }`}
          >
            {isSelected && (
              <span
                aria-hidden="true"
                className="text-white text-[10px] leading-none"
              >
                ✓
              </span>
            )}
          </button>
          {!hideCompleted && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              style={{ touchAction: "none" }}
              className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400 select-none"
              aria-label="並び替え"
            >
              ⠿
            </button>
          )}
          <div className="hidden sm:flex shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onOutdentItem(list.id, item.id)}
              disabled={currentIndent === 0}
              className="w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs rounded transition-colors"
              aria-label="インデントを下げる"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onIndentItem(list.id, item.id)}
              disabled={currentIndent >= maxIndent}
              className="w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs rounded transition-colors"
              aria-label="インデントを上げる"
            >
              →
            </button>
          </div>
          {isParent ? (
            <button
              type="button"
              onClick={() => toggleCollapseItem(item.id)}
              className="shrink-0 w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 flex items-center justify-center text-xs transition-colors"
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "子Todoを展開" : "子Todoを折りたたむ"}
            >
              {isCollapsed ? "▶" : "▼"}
            </button>
          ) : (
            <span className="shrink-0 w-5" />
          )}
          <button
            type="button"
            onClick={() => {
              if (isDragActive) return;
              onToggleItem(list.id, item.id);
            }}
            className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              item.isCompleted
                ? "bg-teal-500 border-teal-500"
                : "border-gray-300 dark:border-gray-400 hover:border-teal-400"
            }`}
            aria-label={item.isCompleted ? "未完了に戻す" : "完了にする"}
          >
            {item.isCompleted && (
              <span className="text-white text-xs leading-none">✓</span>
            )}
          </button>
          {editingItemId === item.id ? (
            <input
              type="text"
              autoFocus
              value={editingItemTitle}
              onChange={(e) => setEditingItemTitle(e.target.value)}
              onBlur={() => commitEditItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isImeComposingKeyDown(e))
                  commitEditItem(item.id);
                if (e.key === "Escape") cancelEditItem();
              }}
              className="flex-1 min-w-0 text-sm px-1 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
            />
          ) : (
            <span
              className={`flex-1 min-w-0 text-sm break-words ${
                item.isCompleted
                  ? "line-through text-gray-400 dark:text-gray-500"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {item.title}
            </span>
          )}
          {editingItemId !== item.id && (
            <>
              {/* デスクトップ: ホバーで表示するアクションボタン群 */}
              <div className="relative hidden sm:block" data-color-picker>
                <button
                  type="button"
                  onClick={() => toggleItemColorPicker(item.id)}
                  className="shrink-0 text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity"
                  aria-label="背景色を変更"
                  aria-expanded={colorPickerItemId === item.id}
                >
                  🎨
                </button>
                {colorPickerItemId === item.id && (
                  <div
                    role="radiogroup"
                    aria-label="背景色"
                    className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex gap-1.5"
                  >
                    {TODO_ITEM_BG_COLORS.map((color) => (
                      <button
                        key={color.value ?? "__default__"}
                        role="radio"
                        aria-checked={item.bgColor === color.value}
                        type="button"
                        onClick={() => {
                          onUpdateItemBgColor(list.id, item.id, color.value);
                          closeItemColorPicker();
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${color.class} ${
                          item.bgColor === color.value
                            ? "border-teal-500 ring-2 ring-teal-300"
                            : "border-gray-200 dark:border-gray-500 hover:border-teal-400"
                        }`}
                        aria-label={color.label}
                        title={color.label}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => startEditItem(item.id, item.title)}
                className="hidden sm:inline-flex shrink-0 text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label={texts.list.editItemLabel}
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => onDeleteItem(list.id, item.id, item.title)}
                className="hidden sm:inline-flex shrink-0 text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label="削除"
              >
                🗑️
              </button>
              <button
                type="button"
                onClick={onInsertAfter}
                aria-expanded={isInlineInsertOpen}
                className="hidden sm:inline-flex shrink-0 items-center gap-0.5 text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label={texts.list.insertAfterLabel}
                title={texts.list.insertAfterLabel}
              >
                <span className="text-xs leading-none">＋</span>
                <span className="text-[10px] leading-none">↓</span>
              </button>

              {/* モバイル: ⋮ ボタン（アクション一覧トリガー） */}
              <div className="sm:hidden" data-mobile-menu>
                <button
                  type="button"
                  onClick={() => toggleMobileMenu(item.id)}
                  aria-label="アクションメニュー"
                  aria-expanded={mobileMenuItemId === item.id}
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg leading-none"
                >
                  ⋮
                </button>
              </div>
            </>
          )}
        </div>
      </SwipeableRoutineItem>

      {/* モバイルドロップダウン — SwipeableRoutineItem の overflow-hidden 外に配置 */}
      {mobileMenuItemId === item.id && (
        <div
          role="menu"
          data-mobile-menu
          className="absolute right-0 top-full mt-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-50 min-w-[10rem] py-1 max-h-[60vh] overflow-y-auto"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              startEditItem(item.id, item.title);
              closeMobileMenu();
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            ✏️ {texts.list.editItemLabel}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onInsertAfter();
              closeMobileMenu();
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            ＋↓ {texts.list.insertAfterLabel}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOutdentItem(list.id, item.id);
              closeMobileMenu();
            }}
            disabled={currentIndent === 0}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            ← インデントを下げる
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onIndentItem(list.id, item.id);
              closeMobileMenu();
            }}
            disabled={currentIndent >= maxIndent}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            → インデントを上げる
          </button>
          <div
            className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600"
            data-color-picker
          >
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
              背景色
            </p>
            <div
              role="radiogroup"
              aria-label="背景色"
              className="flex flex-wrap gap-1.5"
            >
              {TODO_ITEM_BG_COLORS.map((color) => (
                <button
                  key={color.value ?? "__default__"}
                  role="radio"
                  aria-checked={item.bgColor === color.value}
                  type="button"
                  onClick={() => {
                    onUpdateItemBgColor(list.id, item.id, color.value);
                    closeMobileMenu();
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color.class} ${
                    item.bgColor === color.value
                      ? "border-teal-500 ring-2 ring-teal-300"
                      : "border-gray-200 dark:border-gray-500"
                  }`}
                  aria-label={color.label}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDeleteItem(list.id, item.id, item.title);
              closeMobileMenu();
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            🗑️ 削除
          </button>
        </div>
      )}
    </li>
  );
};

// ============================================================
// Todo 詳細ビュー
// ============================================================
type DetailViewProps = {
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
};

const DetailView = ({
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
}: DetailViewProps) => {
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
  } = useTodoListDetailViewState({
    list,
    onAddItem,
    onUpdateItemTitle,
    onUpdateListTitle,
  });
  const itemsForParentDetection = hideCompleted
    ? filterIncompleteItems(list.items)
    : list.items;
  const itemIndexById = new Map(
    list.items.map((item, index) => [item.id, index]),
  );
  const parentDetectionIndexById = new Map(
    itemsForParentDetection.map((item, index) => [item.id, index]),
  );

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
  });

  const activeItem = list.items.find((i) => i.id === activeId) ?? null;

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          {/* ヘッダー */}
          <div className="flex items-start justify-between gap-2 mb-6">
            {editingListTitle ? (
              <input
                ref={listTitleInputRef}
                type="text"
                value={editingListTitleValue}
                onChange={(e) => setEditingListTitleValue(e.target.value)}
                onBlur={commitEditListTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isImeComposingKeyDown(e))
                    commitEditListTitle();
                  if (e.key === "Escape") cancelEditListTitle();
                }}
                className="flex-1 text-xl font-bold px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-900 dark:text-black focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-black truncate">
                  {list.title}
                </h1>
                <button
                  type="button"
                  onClick={startEditListTitle}
                  className="shrink-0 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-sm"
                  aria-label={texts.list.editListTitleLabel}
                >
                  ✏️
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => onDeleteList(list)}
              className="shrink-0 text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
            >
              {texts.list.deleteListButton}
            </button>
          </div>

          {/* 進捗バー */}
          {total > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600 dark:text-gray-700">
                  {texts.list.completedCount
                    .replace("{completed}", String(completed))
                    .replace("{total}", String(total))}
                </span>
                <span className="font-semibold text-teal-600 dark:text-teal-700">
                  {percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* 完了済みトグル + 一括背景色 */}
          <div className="mb-4 flex items-center justify-between">
            <div className="relative" data-color-picker>
              <button
                type="button"
                onClick={toggleBulkColorPicker}
                className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
                aria-label="一括背景色変更"
                aria-expanded={showBulkColorPicker}
              >
                🎨 一括背景色
              </button>
              {showBulkColorPicker && (
                <div
                  role="radiogroup"
                  aria-label="一括背景色"
                  className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex gap-1.5"
                >
                  {(() => {
                    const bgColors = list.items.map((i) => i.bgColor);
                    // null = 混在（どのスウォッチも選択中にしない）
                    // undefined = 全アイテムがデフォルト色
                    const bulkSelected:
                      | TodoItemBgColorValue
                      | undefined
                      | null =
                      bgColors.length > 0 &&
                      bgColors.every((c) => c === bgColors[0])
                        ? bgColors[0]
                        : null;
                    return TODO_ITEM_BG_COLORS.map((color) => (
                      <button
                        key={color.value ?? "__default__"}
                        role="radio"
                        aria-checked={bulkSelected === color.value}
                        type="button"
                        onClick={() => {
                          onUpdateAllItemsBgColor(list.id, color.value);
                          closeBulkColorPicker();
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${color.class} ${
                          bulkSelected === color.value
                            ? "border-teal-500 ring-2 ring-teal-300"
                            : !color.value
                              ? "border-gray-400 dark:border-gray-300"
                              : "border-gray-200 dark:border-gray-500 hover:border-teal-400"
                        }`}
                        aria-label={color.label}
                        title={color.label}
                      />
                    ));
                  })()}
                </div>
              )}
            </div>
            {list.items.some((item) => item.isCompleted) && (
              <button
                type="button"
                onClick={toggleHideCompleted}
                className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
              >
                {hideCompleted
                  ? texts.list.showCompleted
                  : texts.list.hideCompleted}
              </button>
            )}
          </div>

          {/* Todoアイテム一覧 */}
          {/* 選択アクションバー */}
          {hasSelection && (
            <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-xl">
              <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
                {texts.list.selectedCount.replace(
                  "{count}",
                  String(selectedItemIds.size),
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {texts.list.clearSelectionButton}
                </button>
                <button
                  type="button"
                  onClick={handleCut}
                  className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
                >
                  ✂️ {texts.list.cutButton}
                </button>
              </div>
            </div>
          )}

          {/* クリップボードバー */}
          {hasClipboard && !hasSelection && (
            <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                📋{" "}
                {texts.list.pasteMessage.replace(
                  "{count}",
                  String(clipboardItems.length),
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClearClipboard}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {texts.list.cancelClipboardButton}
                </button>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
                >
                  📋 {texts.list.pasteButton}
                </button>
              </div>
            </div>
          )}

          {visibleItems.length === 0 ? (
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
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={visibleItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2 mb-6">
                  {visibleItems.map((item) => {
                    // origIndex は hideCompleted によるフィルタとは無関係に
                    // list.items（フィルタ前の完全配列）内でのインデックス
                    const origIndex = itemIndexById.get(item.id);
                    if (origIndex === undefined) return null;

                    const parentDetectionIndex = parentDetectionIndexById.get(
                      item.id,
                    );
                    const isParent =
                      parentDetectionIndex !== undefined &&
                      hasChildren(
                        itemsForParentDetection,
                        parentDetectionIndex,
                      );
                    const isCollapsed = collapsedItemIds.has(item.id);
                    const isSelected = selectedItemIds.has(item.id);
                    return (
                      <Fragment key={item.id}>
                        <SortableTodoListItem
                          item={item}
                          list={list}
                          origIndex={origIndex}
                          hideCompleted={hideCompleted}
                          isDragActive={activeId !== null}
                          editingItemId={editingItemId}
                          editingItemTitle={editingItemTitle}
                          setEditingItemTitle={setEditingItemTitle}
                          commitEditItem={commitEditItem}
                          cancelEditItem={cancelEditItem}
                          startEditItem={startEditItem}
                          isSelected={isSelected}
                          toggleSelectItem={toggleSelectItem}
                          isParent={isParent}
                          isCollapsed={isCollapsed}
                          toggleCollapseItem={toggleCollapseItem}
                          colorPickerItemId={colorPickerItemId}
                          toggleItemColorPicker={toggleItemColorPicker}
                          closeItemColorPicker={closeItemColorPicker}
                          onUpdateItemBgColor={onUpdateItemBgColor}
                          onToggleItem={onToggleItem}
                          onDeleteItem={onDeleteItem}
                          onIndentItem={onIndentItem}
                          onOutdentItem={onOutdentItem}
                          isInlineInsertOpen={insertAfterId === item.id}
                          onInsertAfter={() => openInlineInsert(item.id)}
                          mobileMenuItemId={mobileMenuItemId}
                          toggleMobileMenu={toggleMobileMenu}
                          closeMobileMenu={closeMobileMenu}
                        />
                        {insertAfterId === item.id && (
                          <InlineInsertForm
                            inputText={inlineInputText}
                            onChangeText={setInlineInputText}
                            onAdd={() => handleInlineAdd(origIndex)}
                            onCancel={closeInlineInsert}
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
                    className={`p-3 ${getTodoItemBgClass(activeItem.bgColor)} border border-teal-400 dark:border-teal-500 rounded-xl shadow-lg text-sm text-gray-800 dark:text-gray-100 opacity-90 cursor-grabbing`}
                  >
                    {activeItem.title}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* 追加フォーム */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
                  handleAdd();
                }
              }}
              placeholder={texts.list.itemPlaceholder}
              className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
            >
              {texts.list.addButton}
            </button>
          </div>
        </CardPanel>
      </main>
    </div>
  );
};

// ============================================================
// リスト詳細の状態管理コンテナ（key={listId} でリスト切替時に再マウント）
// ============================================================
type TodoListDetailProps = {
  listId: string;
  clipboardItems: TodoListItem[];
  onSetClipboard: (items: TodoListItem[]) => void;
  onClearClipboard: () => void;
};

const TodoListDetail = ({
  listId,
  clipboardItems,
  onSetClipboard,
  onClearClipboard,
}: TodoListDetailProps) => {
  const { list, detailHandlers } = useTodoListDetailState(listId);

  if (!list || !detailHandlers) {
    // リストが削除された場合などのフォールバック
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
        <main className="max-w-2xl mx-auto px-4 py-8">
          <CardPanel>
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">{texts.page.emptyMessage}</p>
              <p className="text-sm mt-1">{texts.page.emptyHint}</p>
            </div>
          </CardPanel>
        </main>
      </div>
    );
  }

  return (
    <DetailView
      list={list}
      {...detailHandlers}
      clipboardItems={clipboardItems}
      onSetClipboard={onSetClipboard}
      onClearClipboard={onClearClipboard}
    />
  );
};

// ============================================================
// メインページコンポーネント
// ============================================================
export const TodoListsPage = () => {
  const { effectiveSelectedId } = useTodoListSelectionState();
  const { clipboardItems, setClipboard, clearClipboard } =
    useTodoListDetailClipboard();

  if (!effectiveSelectedId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
        <main className="max-w-2xl mx-auto px-4 py-8">
          <CardPanel>
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">{texts.page.emptyMessage}</p>
              <p className="text-sm mt-1">{texts.page.emptyHint}</p>
            </div>
          </CardPanel>
        </main>
      </div>
    );
  }

  // key={selectedId} により、リスト切替時に TodoListDetail が再マウントされ
  // useState の初期値として最新の localStorage データが読み込まれる
  return (
    <TodoListDetail
      key={effectiveSelectedId}
      listId={effectiveSelectedId}
      clipboardItems={clipboardItems}
      onSetClipboard={setClipboard}
      onClearClipboard={clearClipboard}
    />
  );
};
