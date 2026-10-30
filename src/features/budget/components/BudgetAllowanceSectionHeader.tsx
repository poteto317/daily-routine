"use client";

import type { ReactNode } from "react";
import texts from "../locales/ja.json";

type BudgetAllowanceSectionHeaderProps = {
  title: ReactNode;
  showAddButton: boolean;
  onAdd: () => void;
};

/** 許可設定ページの各セクション見出しと、項目追加ボタン（フォーム表示中は非表示）。 */
export const BudgetAllowanceSectionHeader = ({
  title,
  showAddButton,
  onAdd,
}: BudgetAllowanceSectionHeaderProps) => (
  <div className="flex items-center justify-between gap-3 mb-3">
    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900">
      {title}
    </h2>
    {showAddButton && (
      <button
        type="button"
        onClick={onAdd}
        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        {texts.allowanceSettings.addButton}
      </button>
    )}
  </div>
);
