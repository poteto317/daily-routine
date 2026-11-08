"use client";

import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { getTodoItemBgClass } from "./todoItemBgColor";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import { TodoItemDragHandle } from "./TodoItemDragHandle";
import texts from "./locales/ja.json";

type Props = {
  category: TodoCategory;
  editingCategoryId: string | null;
  editingCategoryNameValue: string;
  onChangeNameValueAction: (value: string) => void;
  onCommitEditAction: () => void;
  onCancelEditAction: () => void;
  onStartEditAction: (categoryId: string, name: string) => void;
  colorEditingCategoryId: string | null;
  onToggleColorPickerAction: (categoryId: string) => void;
  onCloseColorPickerAction: () => void;
  onUpdateColorAction: (
    categoryId: string,
    color: TodoItemBgColorValue | undefined,
  ) => void;
  onDeleteAction: (category: TodoCategory) => void;
};

/** 管理画面の個別カテゴリ行（名前表示/編集・色編集・編集/削除ボタン）。 */
export const TodoCategoryManagementItem = ({
  category,
  editingCategoryId,
  editingCategoryNameValue,
  onChangeNameValueAction,
  onCommitEditAction,
  onCancelEditAction,
  onStartEditAction,
  colorEditingCategoryId,
  onToggleColorPickerAction,
  onCloseColorPickerAction,
  onUpdateColorAction,
  onDeleteAction,
}: Props) => {
  const isEditing = editingCategoryId === category.id;
  const isColorEditing = colorEditingCategoryId === category.id;
  const suppressNextBlurCommitRef = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-200 rounded-lg"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <TodoItemDragHandle
          attributes={attributes}
          listeners={listeners}
          tone="onLight"
        />
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={editingCategoryNameValue}
            onChange={(e) => onChangeNameValueAction(e.target.value)}
            onBlur={() => {
              if (suppressNextBlurCommitRef.current) {
                suppressNextBlurCommitRef.current = false;
                return;
              }
              onCommitEditAction();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
                suppressNextBlurCommitRef.current = true;
                onCommitEditAction();
              }
              if (e.key === "Escape") {
                suppressNextBlurCommitRef.current = true;
                onCancelEditAction();
              }
            }}
            className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-900 focus:outline-none"
          />
        ) : (
          <span className="text-sm font-medium min-w-0 break-words text-gray-700 dark:text-gray-700">
            🏷️ {category.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative" data-color-picker>
          <button
            type="button"
            onClick={() => onToggleColorPickerAction(category.id)}
            className={`w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 ${getTodoItemBgClass(category.color)}`}
            aria-label={`${category.name} の${texts.categoryManagement.colorLabel}を変更`}
            aria-expanded={isColorEditing}
          />
          {isColorEditing && (
            <div className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-10 flex gap-1.5">
              <TodoItemColorSwatches
                selectedColor={category.color}
                onSelectAction={(value) => {
                  onUpdateColorAction(category.id, value);
                  onCloseColorPickerAction();
                }}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => onStartEditAction(category.id, category.name)}
            className="text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-700 transition-colors text-base leading-none"
            aria-label={`${category.name} を編集`}
          >
            ✏️
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteAction(category)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-600 transition-colors text-base leading-none ml-1"
          aria-label={`${category.name} を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
