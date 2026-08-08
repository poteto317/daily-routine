"use client";

import texts from "./locales/ja.json";

type Props = {
  hasAnyItems: boolean;
};

/**
 * Todoリストが空（または完了済みのみで非表示）のときの表示。
 * hasAnyItems=false: そもそもアイテムが1件もない。
 * hasAnyItems=true: アイテムはあるが、全て完了済みで hideCompleted により非表示。
 */
export const TodoListEmptyState = ({ hasAnyItems }: Props) => (
  <div className="text-center py-10 text-gray-400 dark:text-gray-500">
    <p className="text-3xl mb-2">✅</p>
    <p className="text-sm font-medium">
      {hasAnyItems ? "完了済みのみです" : texts.list.emptyMessage}
    </p>
    {!hasAnyItems && (
      <p className="text-xs mt-1">{texts.list.emptyDescription}</p>
    )}
  </div>
);
