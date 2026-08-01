"use client";

import type { TodoCategory, TodoItemBgColorValue, TodoListItem } from "./types";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import { TodoCategorySwatches } from "./TodoCategorySwatches";
import texts from "./locales/ja.json";

type TodoItemMobileMenuProps = {
  item: Pick<TodoListItem, "id" | "title" | "bgColor" | "categoryId">;
  listId: string;
  categories: TodoCategory[];
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  mobileMenuItemId: string | null;
  toggleMobileMenuAction: (id: string) => void;
  closeMobileMenuAction: () => void;
  startEditItemAction: (id: string, title: string) => void;
  onInsertAfterAction: () => void;
  onOutdentItemAction: (listId: string, itemId: string) => void;
  onIndentItemAction: (listId: string, itemId: string) => void;
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
  onDeleteItemAction: (listId: string, itemId: string, title: string) => void;
};

/**
 * Todoアイテムのモバイル用アクションメニュー。
 * ⋮ トリガーボタンと、タップで開くドロップダウンメニューを含む。
 * SwipeableRoutineItem の overflow-hidden の外に配置するため、
 * ドロップダウンは <li> 直下（SwipeableRoutineItem の兄弟）として
 * 親コンポーネントがレンダリングする必要がある。
 */
export const TodoItemMobileTrigger = ({
  item,
  mobileMenuItemId,
  toggleMobileMenuAction,
}: Pick<TodoItemMobileMenuProps, "item" | "mobileMenuItemId" | "toggleMobileMenuAction">) => (
  <div
    className="sm:hidden"
    data-mobile-menu
    onTouchStartCapture={(e) => e.stopPropagation()}
    onMouseDownCapture={(e) => e.stopPropagation()}
  >
    <button
      type="button"
      onClick={() => toggleMobileMenuAction(item.id)}
      aria-label="アクションメニュー"
      aria-haspopup="true"
      aria-expanded={mobileMenuItemId === item.id}
      aria-controls={`mobile-menu-${item.id}`}
      className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg leading-none"
    >
      ⋮
    </button>
  </div>
);

/**
 * モバイル用ドロップダウンメニュー本体。
 * `mobileMenuItemId === item.id` の場合のみ表示する。
 * インデント上げ/下げボタンは、sortModeActive中は生配列の隣接関係が
 * 画面表示と乖離しうるため無効化する（TodoItemIndentButtons.tsx と同じ理由）。
 */
export const TodoItemMobileDropdown = ({
  item,
  listId,
  categories,
  currentIndent,
  maxIndent,
  sortModeActive,
  mobileMenuItemId,
  closeMobileMenuAction,
  startEditItemAction,
  onInsertAfterAction,
  onOutdentItemAction,
  onIndentItemAction,
  onUpdateItemBgColorAction,
  onUpdateItemCategoryAction,
  onDeleteItemAction,
}: Omit<TodoItemMobileMenuProps, "toggleMobileMenuAction">) => {
  if (mobileMenuItemId !== item.id) return null;

  return (
    <div
      id={`mobile-menu-${item.id}`}
      aria-label="アクションメニュー"
      data-mobile-menu
      className="absolute right-0 top-full mt-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-50 min-w-[10rem] py-1 max-h-[60vh] overflow-y-auto"
    >
      <button
        type="button"
        onClick={() => {
          startEditItemAction(item.id, item.title);
          closeMobileMenuAction();
        }}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
      >
        ✏️ {texts.list.editItemLabel}
      </button>
      <button
        type="button"
        onClick={() => {
          onInsertAfterAction();
          closeMobileMenuAction();
        }}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
      >
        ＋↓ {texts.list.insertAfterLabel}
      </button>
      <button
        type="button"
        onClick={() => {
          onOutdentItemAction(listId, item.id);
          closeMobileMenuAction();
        }}
        disabled={currentIndent === 0 || sortModeActive}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        ← インデントを下げる
      </button>
      <button
        type="button"
        onClick={() => {
          onIndentItemAction(listId, item.id);
          closeMobileMenuAction();
        }}
        disabled={currentIndent >= maxIndent || sortModeActive}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        → インデントを上げる
      </button>
      <div
        className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600"
        data-color-picker
      >
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">背景色</p>
        <TodoItemColorSwatches
          selectedColor={item.bgColor}
          className="flex flex-wrap gap-1.5"
          onSelectAction={(value) => {
            onUpdateItemBgColorAction(listId, item.id, value);
            closeMobileMenuAction();
          }}
        />
      </div>
      <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
          {texts.list.categoryPickerLabel}
        </p>
        <TodoCategorySwatches
          categories={categories}
          selectedCategoryId={item.categoryId}
          className="flex flex-wrap gap-1.5"
          onSelectAction={(categoryId) => {
            onUpdateItemCategoryAction(listId, item.id, categoryId);
            closeMobileMenuAction();
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          onDeleteItemAction(listId, item.id, item.title);
          closeMobileMenuAction();
        }}
        className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
      >
        🗑️ 削除
      </button>
    </div>
  );
};
