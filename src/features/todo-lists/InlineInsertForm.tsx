"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import texts from "./locales/ja.json";

type InlineInsertFormProps = {
  inputText: string;
  onChangeText: (text: string) => void;
  onAdd: () => void;
  onCancel: () => void;
};

/**
 * アイテムの直後に表示されるインライン挿入フォーム。
 */
export const InlineInsertForm = ({
  inputText,
  onChangeText,
  onAdd,
  onCancel,
}: InlineInsertFormProps) => (
  <li>
    <div
      role="form"
      aria-label="アイテムを挿入"
      className="flex gap-2 py-1.5 pl-2"
    >
      <input
        type="text"
        autoFocus
        aria-label={texts.list.itemPlaceholder}
        value={inputText}
        onChange={(e) => onChangeText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
            onAdd();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        placeholder={texts.list.itemPlaceholder}
        className="flex-1 text-sm px-3 py-1.5 border border-teal-300 dark:border-teal-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!inputText.trim()}
        className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
      >
        {texts.list.addButton}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 px-2 transition-colors"
        aria-label="キャンセル"
      >
        ✕
      </button>
    </div>
  </li>
);
