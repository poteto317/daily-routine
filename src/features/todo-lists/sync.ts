import type { TodoList } from "./types";
import { saveTodoLists } from "./storage";

/**
 * Todoリストを LocalStorage に保存する。
 *
 * ⚠️ クラウド同期は行わない。
 * 同期は手動操作（設定画面「クラウドに保存」）または syncLatest による
 * リモート変更検知時に一括して実行される。
 */
export const saveAndSyncTodoLists = (lists: TodoList[]): void => {
  saveTodoLists(lists);
};
