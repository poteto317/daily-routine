"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import texts from "./locales/ja.json";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  titleInput: string;
  onChangeTitleAction: (value: string) => void;
  onCreateAction: () => void;
  onCancelAction: () => void;
};

/** 新規 Todo リスト作成フォーム（入力 + 作成/キャンセルボタン）。 */
export const TodoListCreateForm = ({
  inputRef,
  titleInput,
  onChangeTitleAction,
  onCreateAction,
  onCancelAction,
}: Props) => (
  <div className="mb-4 p-4 bg-teal-50 dark:bg-gray-700 border border-teal-200 dark:border-gray-500 rounded-xl">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
      {texts.management.createTitle}
    </p>
    <input
      ref={inputRef}
      type="text"
      value={titleInput}
      onChange={(e) => onChangeTitleAction(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
          onCreateAction();
        }
        if (e.key === "Escape") {
          onCancelAction();
        }
      }}
      placeholder={texts.management.titlePlaceholder}
      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 mb-3"
    />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCreateAction}
        disabled={!titleInput.trim()}
        className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {texts.management.createButton}
      </button>
      <button
        type="button"
        onClick={onCancelAction}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 px-3 py-2"
      >
        {texts.management.cancelButton}
      </button>
    </div>
  </div>
);
