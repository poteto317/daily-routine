import type { TodoList } from "./todoTypes";

export type TodoListSummary = Omit<TodoList, "items"> & {
  itemCount: number;
  completedCount: number;
};

/** 一覧用の要約（アイテム本体は含めない。アイテムは /todo/items で取得する） */
export const summarizeList = (list: TodoList): TodoListSummary => {
  const { items, ...rest } = list;
  const safeItems = Array.isArray(items) ? items : [];
  return {
    ...rest,
    itemCount: safeItems.length,
    completedCount: safeItems.filter((item) => item.isCompleted).length,
  };
};
