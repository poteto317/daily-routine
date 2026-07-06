"use client";

import { useRef } from "react";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { BudgetCategory } from "@/types/routine";

type Props = {
  category: BudgetCategory;
  editingCategoryId: string | null;
  editingCategoryNameValue: string;
  onChangeNameValue: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (categoryId: string, name: string) => void;
  onDelete: (category: BudgetCategory) => void;
};

/** 管理画面の個別カテゴリ行（名前表示/編集・編集/削除ボタン）。 */
export const BudgetCategoryManagementItem = ({
  category,
  editingCategoryId,
  editingCategoryNameValue,
  onChangeNameValue,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: Props) => {
  const isEditing = editingCategoryId === category.id;
  const suppressNextBlurCommitRef = useRef(false);

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-200 rounded-lg">
      {isEditing ? (
        <input
          type="text"
          autoFocus
          value={editingCategoryNameValue}
          onChange={(e) => onChangeNameValue(e.target.value)}
          onBlur={() => {
            if (suppressNextBlurCommitRef.current) {
              suppressNextBlurCommitRef.current = false;
              return;
            }
            onCommitEdit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
              suppressNextBlurCommitRef.current = true;
              onCommitEdit();
            }
            if (e.key === "Escape") {
              suppressNextBlurCommitRef.current = true;
              onCancelEdit();
            }
          }}
          className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-blue-400 bg-transparent text-gray-800 dark:text-gray-900 focus:outline-none"
        />
      ) : (
        <span className="text-sm font-medium min-w-0 break-words text-gray-700 dark:text-gray-900">
          🏷️ {category.name}
        </span>
      )}
      <div className="flex items-center gap-3 shrink-0">
        {!isEditing && (
          <button
            type="button"
            onClick={() => onStartEdit(category.id, category.name)}
            className="text-gray-300 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-600 transition-colors text-base leading-none"
            aria-label={`${category.name} を編集`}
          >
            ✏️
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-500 transition-colors text-base leading-none ml-1"
          aria-label={`${category.name} を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
