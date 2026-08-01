"use client";

import texts from "./locales/ja.json";

type TodoListManagementHeaderProps = {
  showForm: boolean;
  onOpenFormAction: () => void;
};

/**
 * 管理画面のヘッダー（タイトル・説明・追加ボタン）。
 */
export const TodoListManagementHeader = ({
  showForm,
  onOpenFormAction,
}: TodoListManagementHeaderProps) => (
  <>
    <div className="flex items-center justify-between gap-3 mb-2">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
        {texts.management.title}
      </h1>
      {!showForm && (
        <button
          type="button"
          onClick={onOpenFormAction}
          className="text-sm bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {texts.management.addButton}
        </button>
      )}
    </div>

    <p className="text-sm text-gray-500 dark:text-gray-600 mb-6">
      {texts.management.description}
    </p>
  </>
);
