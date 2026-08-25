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

/**
 * リモートに存在しないフィールドは、その機能を知らない古いバージョンの端末が
 * アップロードしたデータである可能性がある。[]で正規化すると同期対象なし＝
 * ローカルのデータを削除、と誤って上書きしてしまうため、欠損時はローカルの値を
 * 維持する。
 * （明示的な空配列[]はユーザーが全削除した結果としてそのまま尊重する）
 */
export const normalizeTodoListSyncData = (
  data: Partial<TodoListSyncData>,
): TodoListSyncData => ({
  todoLists: data.todoLists ?? getTodoLists(),
  todoCategories: data.todoCategories ?? getTodoCategories(),
});

export const saveTodoListSyncData = (data: TodoListSyncData): void => {
  saveTodoLists(data.todoLists);
  saveTodoCategories(data.todoCategories);
};

export const hasTodoListSyncData = (data: TodoListSyncDataSummary): boolean =>
  data.todoLists.length > 0 || data.todoCategories.length > 0;
