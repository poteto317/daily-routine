"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import texts from "./locales/ja.json";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  nameInput: string;
  colorInput: TodoItemBgColorValue | undefined;
  onChangeName: (value: string) => void;
  onChangeColor: (color: TodoItemBgColorValue | undefined) => void;
  onCreate: () => void;
  onCancel: () => void;
};

/** 新規カテゴリ作成フォーム（名前入力 + 色選択 + 作成/キャンセルボタン）。 */
export const TodoCategoryCreateForm = ({
  inputRef,
  nameInput,
  colorInput,
  onChangeName,
  onChangeColor,
  onCreate,
  onCancel,
}: Props) => (
  <div className="mb-4 p-4 bg-teal-50 dark:bg-gray-700 border border-teal-200 dark:border-gray-500 rounded-xl">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
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
      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 mb-3"
    />
    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
      {texts.categoryManagement.colorLabel}
    </p>
    <TodoItemColorSwatches
      selectedColor={colorInput}
      onSelect={onChangeColor}
      className="flex flex-wrap gap-1.5 mb-3"
    />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCreate}
        disabled={!nameInput.trim()}
        className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {texts.categoryManagement.createButton}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 px-3 py-2"
      >
        {texts.categoryManagement.cancelButton}
      </button>
    </div>
  </div>
);
