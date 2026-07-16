"use client";

import type { TodoCategory } from "./types";
import { getTodoItemBgClass } from "./todoItemBgColor";
import texts from "./locales/ja.json";

export type TodoCategorySwatchesProps = {
  categories: TodoCategory[];
  /** 現在選択中のカテゴリID。undefined = 未分類 */
  selectedCategoryId: string | undefined;
  /** カテゴリが選択されたときのコールバック。未分類選択時は undefined */
  onSelect: (categoryId: string | undefined) => void;
  /** radiogroup の追加 className */
  className?: string;
};

/**
 * カテゴリピッカーのスウォッチ一覧（role="radiogroup"）。
 * TodoItemColorSwatches と同様、アイテム単体・モバイルメニューの箇所で共用する。
 * 各スウォッチの背景色はそのカテゴリに割り当てられた色（未設定の場合はデフォルト）。
 */
export const TodoCategorySwatches = ({
  categories,
  selectedCategoryId,
  onSelect,
  className = "",
}: TodoCategorySwatchesProps) => {
  // カテゴリ削除後などで selectedCategoryId が categories に存在しない場合は
  // 未分類として扱う（todoCategoryLookup.ts の resolveTodoItemCategory と
  // 同じフォールバック方針）。これを正規化しないと、どのボタンも
  // aria-checked=true にならない状態になってしまう。
  const isUncategorized =
    selectedCategoryId === undefined ||
    !categories.some((category) => category.id === selectedCategoryId);

  return (
    <div role="radiogroup" aria-label={texts.list.categoryPickerLabel} className={className}>
      <button
        role="radio"
        aria-checked={isUncategorized}
        type="button"
        onClick={() => onSelect(undefined)}
        className={`px-2 py-1 rounded-lg border text-xs transition-all ${
          isUncategorized
            ? "border-teal-500 ring-2 ring-teal-300 bg-white dark:bg-gray-700"
            : "border-gray-200 dark:border-gray-500 hover:border-teal-400 bg-white dark:bg-gray-700"
        }`}
        aria-label={texts.list.uncategorizedLabel}
        title={texts.list.uncategorizedLabel}
      >
        {texts.list.uncategorizedLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          role="radio"
          aria-checked={selectedCategoryId === category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`px-2 py-1 rounded-lg border text-xs transition-all ${getTodoItemBgClass(category.color)} ${
            selectedCategoryId === category.id
              ? "border-teal-500 ring-2 ring-teal-300"
              : "border-gray-200 dark:border-gray-500 hover:border-teal-400"
          }`}
          aria-label={category.name}
          title={category.name}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
