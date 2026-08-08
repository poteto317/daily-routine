"use client";

import type { TodoItemBgColorValue } from "./types";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";

type Props = {
  selectedColor: TodoItemBgColorValue | undefined;
  onSelect: (color: TodoItemBgColorValue | undefined) => void;
};

/** アクションメニュー内の背景色セクション（ラベル + スウォッチ） */
export const TodoItemActionMenuColorSection = ({ selectedColor, onSelect }: Props) => (
  <div
    className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600"
    data-color-picker
  >
    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">背景色</p>
    <TodoItemColorSwatches
      selectedColor={selectedColor}
      className="flex flex-wrap gap-1.5"
      onSelectAction={onSelect}
    />
  </div>
);
