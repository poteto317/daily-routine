/** アプリ側 TODO_ITEM_BG_COLORS（src/features/todo-lists/todoItemBgColor.ts）の value と同じ */
export const TODO_BG_COLORS = [
  "bg-red-50",
  "bg-orange-50",
  "bg-yellow-50",
  "bg-green-50",
  "bg-blue-50",
  "bg-purple-50",
  "bg-pink-50",
] as const;

export type TodoBgColor = (typeof TODO_BG_COLORS)[number];

export const ADD_ITEM_POSITIONS = ["first", "last"] as const;
export type AddItemPosition = (typeof ADD_ITEM_POSITIONS)[number];

/** アプリ側の indent の上限（todoListItemStructureMutations.ts と同じ） */
export const MAX_INDENT = 3;

export type TodoItem = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  indent?: number;
  bgColor?: TodoBgColor;
  categoryId?: string;
};

export type TodoList = {
  id: string;
  title: string;
  items: TodoItem[];
  createdAt: string;
  updatedAt: string;
  isHidden?: boolean;
  defaultItemBgColor?: TodoBgColor;
  addItemPosition?: AddItemPosition;
  hideCompleted?: boolean;
};
