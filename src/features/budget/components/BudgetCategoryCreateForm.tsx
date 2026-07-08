"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import texts from "../locales/ja.json";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  nameInput: string;
  onChangeName: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
};

/** 新規カテゴリ作成フォーム（入力 + 作成/キャンセルボタン）。 */
export const BudgetCategoryCreateForm = ({
  inputRef,
  nameInput,
  onChangeName,
  onCreate,
  onCancel,
}: Props) => (
  <div className="mb-4 p-4 bg-blue-50 dark:bg-gray-200 border border-blue-200 dark:border-gray-400 rounded-xl">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-900 mb-3">
      {texts.categoryManagement.createTitle}
    </p>
    <input
      ref={inputRef}
      type="text"
      value={nameInput}
      onChange={(e) => onChangeName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
          onCreate();
        }
        if (e.key === "Escape") {
          onCancel();
        }
      }}
      placeholder={texts.categoryManagement.namePlaceholder}
      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg bg-white dark:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
    />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCreate}
        disabled={!nameInput.trim()}
        className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {texts.categoryManagement.createButton}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-600 px-3 py-2"
      >
        {texts.categoryManagement.cancelButton}
      </button>
    </div>
  </div>
);
