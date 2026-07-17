"use client";

import texts from "../locales/ja.json";

/** 収入/固定費/変動費 各セクションのリストが空のときに表示するビュー。 */
export const BudgetAllowanceSectionEmptyState = () => (
  <div className="text-center py-6 text-gray-400 dark:text-gray-500">
    <p className="text-sm font-medium">
      {texts.allowanceSettings.emptyMessage}
    </p>
    <p className="text-xs mt-1">{texts.allowanceSettings.emptyDescription}</p>
  </div>
);
