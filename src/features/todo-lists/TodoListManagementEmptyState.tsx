"use client";

import texts from "./locales/ja.json";

/**
 * 管理画面のリストが空のときに表示するビュー。
 */
export const TodoListManagementEmptyState = () => (
  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
    <p className="text-3xl mb-2">📝</p>
    <p className="text-sm font-medium">{texts.management.emptyMessage}</p>
    <p className="text-xs mt-1">{texts.management.emptyDescription}</p>
  </div>
);
