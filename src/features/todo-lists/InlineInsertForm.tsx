"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import { useInlineInsertSubmit } from "./useInlineInsertSubmit";
import texts from "./locales/ja.json";

type InlineInsertFormProps = {
  inputText: string;
  onChangeTextAction: (text: string) => void;
  onAddAction: () => void;
  onCancelAction: () => void;
};

/**
 * アイテムの直後に表示されるインライン挿入フォーム。
 * 送信時のバリデーションと blur は useInlineInsertSubmit が担う。
 */
export const InlineInsertForm = ({
  inputText,
  onChangeTextAction,
  onAddAction,
  onCancelAction,
}: InlineInsertFormProps) => {
  const { inputRef, canSubmit, handleAdd } = useInlineInsertSubmit({
    inputText,
    onAddAction,
  });

  return (
    <li>
      <div
        role="form"
        aria-label="アイテムを挿入"
        className="flex gap-2 py-1.5 pl-2"
      >
        <input
          ref={inputRef}
          type="text"
          autoFocus
          aria-label={texts.list.itemPlaceholder}
          value={inputText}
          onChange={(e) => onChangeTextAction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
              handleAdd();
            }
            if (e.key === "Escape") {
              onCancelAction();
            }
          }}
          placeholder={texts.list.itemPlaceholder}
          className="flex-1 text-sm px-3 py-1.5 border border-teal-300 dark:border-teal-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canSubmit}
          className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
        >
          {texts.list.addButton}
        </button>
        <button
          type="button"
          onClick={onCancelAction}
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 px-2 transition-colors"
          aria-label="キャンセル"
        >
          ✕
        </button>
      </div>
    </li>
  );
};
