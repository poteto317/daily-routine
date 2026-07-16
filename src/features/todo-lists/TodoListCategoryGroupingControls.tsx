"use client";

import texts from "./locales/ja.json";

export type TodoListCategoryGroupingControlsProps = {
  hasCategories: boolean;
  groupByCategory: boolean;
  onToggleGroupByCategory: () => void;
};

export const TodoListCategoryGroupingControls = ({
  hasCategories,
  groupByCategory,
  onToggleGroupByCategory,
}: TodoListCategoryGroupingControlsProps) => {
  // groupByCategory=true中にカテゴリが全削除されるとhasCategoriesがfalseに
  // なるが、その場合もトグルボタン自体は隠さない。隠すとグルーピングを
  // OFFに戻す手段がなくなり、DnD無効化状態（useTodoListInteractionMode.ts）
  // から抜け出せなくなるため。
  if (!hasCategories && !groupByCategory) return null;

  return (
    <button
      type="button"
      aria-pressed={groupByCategory}
      onClick={onToggleGroupByCategory}
      className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
    >
      {groupByCategory
        ? texts.list.categoryGroupedLabel
        : texts.list.categoryUngroupedLabel}
    </button>
  );
};
