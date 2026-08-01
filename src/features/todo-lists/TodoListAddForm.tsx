"use client";

import type { RefObject } from "react";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import texts from "./locales/ja.json";

export type TodoListAddFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  inputText: string;
  onChangeTextAction: (value: string) => void;
  onAddAction: () => void;
};

/**
 * Todo アイテムの新規追加フォーム（リスト下部）。
 * テキスト入力・Enter キー・追加ボタンを担当する。
 */
export const TodoListAddForm = ({
  inputRef,
  inputText,
  onChangeTextAction,
  onAddAction,
}: TodoListAddFormProps) => (
  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
    <input
      ref={inputRef}
      type="text"
      value={inputText}
      onChange={(e) => onChangeTextAction(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
          onAddAction();
        }
      }}
      placeholder={texts.list.itemPlaceholder}
      className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
    />
    <button
      type="button"
      onClick={onAddAction}
      disabled={!inputText.trim()}
      className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
    >
      {texts.list.addButton}
    </button>
  </div>
);
