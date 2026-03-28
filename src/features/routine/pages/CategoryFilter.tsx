"use client";

import { ROUTINE_CATEGORIES } from "@/types/routine";
import {
  CATEGORY_FILTER_TEXT,
  getCategoryFilterButtonClassName,
} from "./helpers";
import type { HomeCategoryFilterProps as CategoryFilterProps } from "./homeTypes";

/**
 * カテゴリフィルターコンポーネント
 * ルーティンをカテゴリで絞り込むためのフィルターボタン群
 */
export const CategoryFilter = ({
  filterCategory,
  onFilterChangeAction,
}: CategoryFilterProps) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => onFilterChangeAction("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${getCategoryFilterButtonClassName(
            filterCategory === "all",
          )}`}
        >
          {CATEGORY_FILTER_TEXT.all}
        </button>
        {ROUTINE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onFilterChangeAction(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${getCategoryFilterButtonClassName(
              filterCategory === cat.value,
              cat.color,
            )}`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
