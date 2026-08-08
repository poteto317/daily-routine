"use client";

import type { TodoItemBgColorValue } from "./types";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";
import texts from "./locales/ja.json";

type Props = {
  selectedColor: TodoItemBgColorValue | undefined;
  onSelect: (color: TodoItemBgColorValue | undefined) => void;
};

/**
 * アクションメニュー内の背景色セクション（ラベル + スウォッチ）。
 * data-color-picker 属性は付けない: この属性は useColorPickerController の
 * 外側クリック判定（一括カラーピッカー用）が使うものであり、ここに付けると
 * 一括カラーピッカーを開いた状態でこのスウォッチをクリックしても
 * 一括ピッカーが閉じない、という意図しない挙動を生む。
 * このセクション自身の開閉は data-item-menu を持つ親ドロップダウンが担う。
 */
export const TodoItemActionMenuColorSection = ({ selectedColor, onSelect }: Props) => (
  <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600">
    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{texts.list.colorPickerLabel}</p>
    <TodoItemColorSwatches
      selectedColor={selectedColor}
      className="flex flex-wrap gap-1.5"
      onSelectAction={onSelect}
    />
  </div>
);
