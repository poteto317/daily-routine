"use client";

import type { TodoCategory, TodoItemBgColorValue, TodoListItem } from "./types";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import { TodoCategorySwatches } from "./TodoCategorySwatches";
import texts from "./locales/ja.json";

type TodoItemDesktopActionsProps = {
  item: Pick<TodoListItem, "id" | "title" | "bgColor" | "categoryId">;
  listId: string;
  categories: TodoCategory[];
  colorPickerItemId: string | null;
  categoryPickerItemId: string | null;
  isInlineInsertOpen: boolean;
  toggleItemColorPicker: (id: string) => void;
  closeItemColorPicker: () => void;
  toggleItemCategoryPicker: (id: string) => void;
  closeItemCategoryPicker: () => void;
  onUpdateItemBgColor: (
    listId: string,
    itemId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateItemCategory: (
    listId: string,
    itemId: string,
    categoryId: string | undefined,
  ) => void;
  startEditItem: (id: string, title: string) => void;
  onDeleteItem: (listId: string, itemId: string, title: string) => void;
  onInsertAfter: () => void;
};

/**
 * Todoアイテムのデスクトップ用アクションボタン群。
 * ホバー時に表示する、カラーピッカー・カテゴリピッカー・編集・削除・インライン挿入ボタンを含む。
 */
export const TodoItemDesktopActions = ({
  item,
  listId,
  categories,
  colorPickerItemId,
  categoryPickerItemId,
  isInlineInsertOpen,
  toggleItemColorPicker,
  closeItemColorPicker,
  toggleItemCategoryPicker,
  closeItemCategoryPicker,
  onUpdateItemBgColor,
  onUpdateItemCategory,
  startEditItem,
  onDeleteItem,
  onInsertAfter,
}: TodoItemDesktopActionsProps) => (
  <>
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
        <div className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex gap-1.5">
          <TodoItemColorSwatches
            selectedColor={item.bgColor}
            onSelect={(value) => {
              onUpdateItemBgColor(listId, item.id, value);
              closeItemColorPicker();
            }}
          />
        </div>
      )}
    </div>
    <div className="relative hidden sm:block" data-category-picker>
      <button
        type="button"
        onClick={() => toggleItemCategoryPicker(item.id)}
        className="shrink-0 text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity"
        aria-label={texts.list.categoryPickerLabel}
        aria-expanded={categoryPickerItemId === item.id}
      >
        🏷️
      </button>
      {categoryPickerItemId === item.id && (
        <div className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex flex-wrap gap-1.5 w-48">
          <TodoCategorySwatches
            categories={categories}
            selectedCategoryId={item.categoryId}
            onSelect={(categoryId) => {
              onUpdateItemCategory(listId, item.id, categoryId);
              closeItemCategoryPicker();
            }}
          />
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
      onClick={() => onDeleteItem(listId, item.id, item.title)}
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
  </>
);
