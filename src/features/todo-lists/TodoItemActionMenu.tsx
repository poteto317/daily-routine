"use client";

/**
 * Todoアイテムのアクションメニュー（PC/モバイル共通、常時表示）。
 * ⋮ トリガーボタン（TodoItemActionMenuTrigger）と、クリック/タップで開く
 * ドロップダウンメニュー（TodoItemActionMenuDropdown）の2コンポーネントで構成する。
 * SwipeableRoutineItem の overflow-hidden の外に配置するため、
 * ドロップダウンは <li> 直下（SwipeableRoutineItem の兄弟）として
 * 親コンポーネントがレンダリングする必要がある。
 */

import type { TodoCategory, TodoItemBgColorValue, TodoListItem } from "./types";
import { TodoItemActionMenuEditButton } from "./TodoItemActionMenuEditButton";
import { TodoItemActionMenuInsertButton } from "./TodoItemActionMenuInsertButton";
import { TodoItemActionMenuIndentControls } from "./TodoItemActionMenuIndentControls";
import { TodoItemActionMenuColorSection } from "./TodoItemActionMenuColorSection";
import { TodoItemActionMenuCategorySection } from "./TodoItemActionMenuCategorySection";
import { TodoItemActionMenuDeleteButton } from "./TodoItemActionMenuDeleteButton";

type TodoItemActionMenuProps = {
  item: Pick<TodoListItem, "id" | "title" | "bgColor" | "categoryId">;
  listId: string;
  categories: TodoCategory[];
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  itemMenuItemId: string | null;
  toggleItemMenuAction: (id: string) => void;
  closeItemMenuAction: () => void;
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

/** アクションメニューの ⋮ トリガーボタン。クリックでドロップダウンの開閉をトグルする。 */
export const TodoItemActionMenuTrigger = ({
  item,
  itemMenuItemId,
  toggleItemMenuAction,
}: Pick<
  TodoItemActionMenuProps,
  "item" | "itemMenuItemId" | "toggleItemMenuAction"
>) => (
  <div
    data-item-menu
    onTouchStartCapture={(e) => e.stopPropagation()}
    onMouseDownCapture={(e) => e.stopPropagation()}
  >
    <button
      type="button"
      onClick={() => toggleItemMenuAction(item.id)}
      aria-label="アクションメニュー"
      aria-haspopup="true"
      aria-expanded={itemMenuItemId === item.id}
      aria-controls={`item-menu-${item.id}`}
      className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg leading-none"
    >
      ⋮
    </button>
  </div>
);

/**
 * アクションメニューのドロップダウン本体。
 * `itemMenuItemId === item.id` の場合のみ表示する。
 * 各アクション項目（編集・下に追加・インデント・背景色・カテゴリ・削除）は
 * 単一責任のサブコンポーネントに委譲し、ここではそれらを並べて
 * 「アクション実行後にメニューを閉じる」コールバックを合成するだけ。
 */
export const TodoItemActionMenuDropdown = ({
  item,
  listId,
  categories,
  currentIndent,
  maxIndent,
  sortModeActive,
  itemMenuItemId,
  closeItemMenuAction,
  startEditItemAction,
  onInsertAfterAction,
  onOutdentItemAction,
  onIndentItemAction,
  onUpdateItemBgColorAction,
  onUpdateItemCategoryAction,
  onDeleteItemAction,
}: Omit<TodoItemActionMenuProps, "toggleItemMenuAction">) => {
  if (itemMenuItemId !== item.id) return null;

  return (
    <div
      id={`item-menu-${item.id}`}
      aria-label="アクションメニュー"
      data-item-menu
      className="absolute right-0 top-full mt-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-50 min-w-[10rem] py-1 max-h-[60vh] overflow-y-auto"
    >
      <TodoItemActionMenuEditButton
        onClick={() => {
          startEditItemAction(item.id, item.title);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuInsertButton
        onClick={() => {
          onInsertAfterAction();
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuIndentControls
        currentIndent={currentIndent}
        maxIndent={maxIndent}
        sortModeActive={sortModeActive}
        onOutdent={() => {
          onOutdentItemAction(listId, item.id);
          closeItemMenuAction();
        }}
        onIndent={() => {
          onIndentItemAction(listId, item.id);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuColorSection
        selectedColor={item.bgColor}
        onSelect={(value) => {
          onUpdateItemBgColorAction(listId, item.id, value);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuCategorySection
        categories={categories}
        selectedCategoryId={item.categoryId}
        onSelect={(categoryId) => {
          onUpdateItemCategoryAction(listId, item.id, categoryId);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuDeleteButton
        onClick={() => {
          onDeleteItemAction(listId, item.id, item.title);
          closeItemMenuAction();
        }}
      />
    </div>
  );
};
