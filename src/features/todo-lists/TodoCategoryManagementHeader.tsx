"use client";

import texts from "./locales/ja.json";

type TodoCategoryManagementHeaderProps = {
  showForm: boolean;
  onOpenFormAction: () => void;
};

/**
 * カテゴリ管理画面のヘッダー（タイトル・説明・追加ボタン）。
 */
export const TodoCategoryManagementHeader = ({
  showForm,
  onOpenFormAction,
}: TodoCategoryManagementHeaderProps) => (
  <>
    <div className="flex items-center justify-between gap-3 mb-2">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
        {texts.categoryManagement.title}
      </h1>
      {!showForm && (
        <button
          type="button"
          onClick={onOpenFormAction}
          className="text-sm bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
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
