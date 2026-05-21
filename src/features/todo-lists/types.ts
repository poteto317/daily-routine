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
}

/** TodoList 配列の永続化コールバック型 */
export type PersistTodoLists = (nextLists: TodoList[]) => void;
