"use client";

import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { TODO_ITEM_BG_COLORS } from "./todoItemBgColor";

export type TodoItemColorSwatchesProps = {
  /** 現在選択中の色。undefined = デフォルト、null = 混在（どれも選択中にしない） */
  selectedColor: TodoItemBgColorValue | undefined | null;
  /** 色が選択されたときのコールバック */
  onSelectAction: (color: TodoItemBgColorValue | undefined) => void;
  /** デフォルト色スウォッチ（value=undefined）に border-gray-400 を使う（一括選択用） */
  showDefaultBorder?: boolean;
  /** radiogroup の追加 className */
  className?: string;
};

/**
 * カラーピッカーのスウォッチ一覧（role="radiogroup"）。
 * アイテム単体・モバイルメニュー・一括変更の 3 箇所で共用。
 */
export const TodoItemColorSwatches = ({
  selectedColor,
  onSelectAction,
  showDefaultBorder = false,
  className = "",
}: TodoItemColorSwatchesProps) => (
  <div role="radiogroup" aria-label="背景色" className={className}>
    {TODO_ITEM_BG_COLORS.map((color) => (
      <button
        key={color.value ?? "__default__"}
        role="radio"
        aria-checked={selectedColor === color.value}
        type="button"
        onClick={() => onSelectAction(color.value)}
        className={`w-6 h-6 rounded-full border-2 transition-all ${color.class} ${
          selectedColor === color.value
            ? "border-teal-500 ring-2 ring-teal-300"
            : !color.value && showDefaultBorder
              ? "border-gray-400 dark:border-gray-300"
              : "border-gray-200 dark:border-gray-500 hover:border-teal-400"
        }`}
        aria-label={color.label}
        title={color.label}
      />
    ))}
  </div>
);
