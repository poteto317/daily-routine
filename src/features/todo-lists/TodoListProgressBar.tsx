"use client";

import texts from "./locales/ja.json";

export type TodoListProgressBarProps = {
  completed: number;
  total: number;
  percentage: number;
};

/**
 * Todo リストの進捗バー。
 * 完了数・合計・パーセンテージを視覚化する。total が 0 のときは何もレンダリングしない。
 */
export const TodoListProgressBar = ({
  completed,
  total,
  percentage,
}: TodoListProgressBarProps) => {
  if (total === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-600 dark:text-gray-700">
          {texts.list.completedCount
            .replace("{completed}", String(completed))
            .replace("{total}", String(total))}
        </span>
        <span className="font-semibold text-teal-600 dark:text-teal-700">
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
