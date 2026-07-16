"use client";

import { useRef } from "react";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { getTodoItemBgClass } from "./todoItemBgColor";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import texts from "./locales/ja.json";

type Props = {
  category: TodoCategory;
  editingCategoryId: string | null;
  editingCategoryNameValue: string;
  onChangeNameValue: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (categoryId: string, name: string) => void;
  colorEditingCategoryId: string | null;
  onToggleColorPicker: (categoryId: string) => void;
  onCloseColorPicker: () => void;
  onUpdateColor: (
    categoryId: string,
    color: TodoItemBgColorValue | undefined,
  ) => void;
  onDelete: (category: TodoCategory) => void;
};

/** 管理画面の個別カテゴリ行（名前表示/編集・色編集・編集/削除ボタン）。 */
export const TodoCategoryManagementItem = ({
  category,
  editingCategoryId,
  editingCategoryNameValue,
  onChangeNameValue,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  colorEditingCategoryId,
  onToggleColorPicker,
  onCloseColorPicker,
  onUpdateColor,
  onDelete,
}: Props) => {
  const isEditing = editingCategoryId === category.id;
  const isColorEditing = colorEditingCategoryId === category.id;
  const suppressNextBlurCommitRef = useRef(false);

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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
          className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
        />
      ) : (
        <span className="text-sm font-medium min-w-0 break-words text-gray-700 dark:text-gray-300">
          🏷️ {category.name}
        </span>
      )}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative" data-color-picker>
          <button
            type="button"
            onClick={() => onToggleColorPicker(category.id)}
            className={`w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 ${getTodoItemBgClass(category.color)}`}
            aria-label={`${category.name} の${texts.categoryManagement.colorLabel}を変更`}
            aria-expanded={isColorEditing}
          />
          {isColorEditing && (
            <div className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex gap-1.5">
              <TodoItemColorSwatches
                selectedColor={category.color}
                onSelect={(value) => {
                  onUpdateColor(category.id, value);
                  onCloseColorPicker();
                }}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => onStartEdit(category.id, category.name)}
            className="text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-base leading-none"
            aria-label={`${category.name} を編集`}
          >
            ✏️
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-base leading-none ml-1"
          aria-label={`${category.name} を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
