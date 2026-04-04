/** アイテムの背景色として使用できる Tailwind クラス名の union 型 */
export type TodoItemBgColorValue =
  | undefined
  | "bg-red-50"
  | "bg-orange-50"
  | "bg-yellow-50"
  | "bg-green-50"
  | "bg-blue-50"
  | "bg-purple-50"
  | "bg-pink-50";

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
}

/** TodoList 配列の永続化コールバック型 */
export type PersistTodoLists = (nextLists: TodoList[]) => void;
