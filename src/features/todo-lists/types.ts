/** TodoItemBgColorValue は todoItemBgColor.ts の TODO_ITEM_BG_COLORS から派生。型の正典はそちら。 */
export type { TodoItemBgColorValue } from "./todoItemBgColor";
import type { TodoItemBgColorValue } from "./todoItemBgColor";

export interface TodoListItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  /** インデントレベル（0=最上位, 最大3） */
  indent?: number;
  /** アイテムの背景色（Tailwind クラス名） */
  bgColor?: TodoItemBgColorValue;
  /** 割り当てられたカテゴリID。未設定・参照先削除済みの場合は未分類として扱う */
  categoryId?: string;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoListItem[];
  createdAt: string;
  updatedAt: string;
  isHidden?: boolean;
  /** 新規アイテム追加時に適用するデフォルト背景色 */
  defaultItemBgColor?: TodoItemBgColorValue;
  /** 新規アイテムの追加位置（未設定 or 'last' = 末尾、'first' = 先頭） */
  addItemPosition?: "last" | "first";
  /** 完了済みアイテムを下へ移動するか（未設定 = false） */
  moveCompletedToBottom?: boolean;
  /** 完了済みアイテムを非表示にするか（未設定 = false） */
  hideCompleted?: boolean;
  /** アイテムをカテゴリでグルーピング表示するか（未設定 = false） */
  groupByCategory?: boolean;
}

/** Todoアイテムのカテゴリ */
export interface TodoCategory {
  id: string;
  name: string;
  /** カテゴリの背景色（Tailwind クラス名）。未設定の場合はアイテム自身のbgColorにフォールバック */
  color?: TodoItemBgColorValue;
  createdAt: string;
}

/** TodoList 配列の永続化コールバック型 */
export type PersistTodoLists = (nextLists: TodoList[]) => void;

/** TodoCategory 配列の永続化コールバック型 */
export type PersistTodoCategories = (nextCategories: TodoCategory[]) => void;
