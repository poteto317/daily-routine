import {
  getTodoCategories,
  getTodoLists,
  saveTodoCategories,
  saveTodoLists,
} from "@/features/todo-lists/storage";
import type { SyncPayload } from "./types";

export type TodoListSyncData = Pick<
  SyncPayload,
  "todoLists" | "todoCategories"
>;

export type TodoListSyncDataSummary = {
  todoLists: unknown[];
  todoCategories: unknown[];
};

export const collectTodoListSyncData = (): TodoListSyncData => ({
  todoLists: getTodoLists(),
  todoCategories: getTodoCategories(),
});

export const normalizeTodoListSyncData = (
  data: Partial<TodoListSyncData>,
): TodoListSyncData => ({
  todoLists: data.todoLists ?? [],
  // todoCategoriesは本フィールド追加前のクラウドデータには存在しない
  // （undefined）ため、[]で正規化すると同期対象なし＝ローカルのカテゴリを
  // 削除、と誤って上書きしてしまう。欠損時は既存のローカルカテゴリを
  // 保持する（明示的な空配列[]はユーザーが全カテゴリを削除した結果として
  // そのまま尊重する）。
  todoCategories: data.todoCategories ?? getTodoCategories(),
});

export const saveTodoListSyncData = (
  data: TodoListSyncData,
): void => {
  saveTodoLists(data.todoLists);
  saveTodoCategories(data.todoCategories);
};

export const hasTodoListSyncData = (
  data: TodoListSyncDataSummary,
): boolean => data.todoLists.length > 0 || data.todoCategories.length > 0;
