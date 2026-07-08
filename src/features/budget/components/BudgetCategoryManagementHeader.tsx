"use client";

import texts from "../locales/ja.json";

type BudgetCategoryManagementHeaderProps = {
  showForm: boolean;
  onOpenForm: () => void;
};

/** カテゴリ管理画面のヘッダー（タイトル・説明・追加ボタン）。 */
export const BudgetCategoryManagementHeader = ({
  showForm,
  onOpenForm,
}: BudgetCategoryManagementHeaderProps) => (
  <>
    <div className="flex items-center justify-between gap-3 mb-2">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
        {texts.categoryManagement.title}
      </h1>
      {!showForm && (
        <button
          type="button"
          onClick={onOpenForm}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {texts.categoryManagement.addButton}
        </button>
      )}
    </div>

    <p className="text-sm text-gray-500 dark:text-gray-600 mb-6">
      {texts.categoryManagement.description}
    </p>
  </>
);
