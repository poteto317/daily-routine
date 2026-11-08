"use client";

import type { TodoCategory } from "./types";
import { TodoCategorySwatches } from "./TodoCategorySwatches";
import texts from "./locales/ja.json";

type Props = {
  categories: TodoCategory[];
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
};

/** アクションメニュー内のカテゴリセクション（ラベル + スウォッチ） */
export const TodoItemActionMenuCategorySection = ({
  categories,
  selectedCategoryId,
  onSelect,
}: Props) => (
  <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600">
    <p className="text-xs text-gray-400 dark:text-gray-300 mb-1.5">
      {texts.list.categoryPickerLabel}
    </p>
    <TodoCategorySwatches
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      className="flex flex-wrap gap-1.5"
      onSelectAction={onSelect}
    />
  </div>
);
