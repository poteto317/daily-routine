"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import { useDismissKeyboardOnSubmit } from "@/hooks/useDismissKeyboardOnSubmit";
import { normalizeCategoryName } from "./todoCategoryNameNormalization";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import texts from "./locales/ja.json";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  nameInput: string;
  colorInput: TodoItemBgColorValue | undefined;
  onChangeNameAction: (value: string) => void;
  onChangeColorAction: (color: TodoItemBgColorValue | undefined) => void;
  onCreateAction: () => void;
  onCancelAction: () => void;
};

/** 新規カテゴリ作成フォーム（名前入力 + 色選択 + 作成/キャンセルボタン）。 */
export const TodoCategoryCreateForm = ({
  inputRef,
  nameInput,
  colorInput,
  onChangeNameAction,
  onChangeColorAction,
  onCreateAction,
  onCancelAction,
}: Props) => {
  // 空判定はハンドラ側と同じ正規化ヘルパーに委ね、判定方法が分岐しないようにする
  const canSubmit = normalizeCategoryName(nameInput) !== null;
  const { handleSubmit } = useDismissKeyboardOnSubmit({
    canSubmit,
    onSubmit: onCreateAction,
  });

  return (
    <div className="mb-4 p-4 bg-teal-50 dark:bg-gray-700 border border-teal-200 dark:border-gray-500 rounded-xl">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
        {texts.categoryManagement.createTitle}
      </p>
      <input
        ref={inputRef}
        type="text"
        value={nameInput}
        onChange={(e) => onChangeNameAction(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
            handleSubmit();
          }
          if (e.key === "Escape") {
            onCancelAction();
          }
        }}
        placeholder={texts.categoryManagement.namePlaceholder}
        className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 mb-3"
      />
      <p className="text-xs text-gray-400 dark:text-gray-300 mb-1.5">
        {texts.categoryManagement.colorLabel}
      </p>
      <TodoItemColorSwatches
        selectedColor={colorInput}
        onSelectAction={onChangeColorAction}
        className="flex flex-wrap gap-1.5 mb-3"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {texts.categoryManagement.createButton}
        </button>
        <button
          type="button"
          onClick={onCancelAction}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 px-3 py-2"
        >
          {texts.categoryManagement.cancelButton}
        </button>
      </div>
    </div>
  );
};
