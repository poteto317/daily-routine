import type { TodoList } from "./types";
import { saveTodoLists } from "./storage";

/**
 * Todoリストを LocalStorage に保存する。
 *
 * ⚠️ クラウド同期は行わない。
 * 同期は設定画面のクラウドアップロード操作、または syncLatestData による
 * リモート変更検知時に一括して実行される。
 */
export const saveTodoListsToLocal = (lists: TodoList[]): void => {
  saveTodoLists(lists);
};
