"use client";

import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { HTMLAttributes } from "react";

/**
 * ハンドルを置く背景の明るさ（ダークモードの文字色を切り替える）。
 * - onDark: ダークモードで暗い背景の上（Todo アイテム。dark:bg-gray-700・dark:bg-<色>-900 など）
 * - onLight: ダークモードでも明るい背景の上（管理画面の行。dark:bg-gray-200）
 */
export type TodoItemDragHandleTone = "onDark" | "onLight";

const TONE_CLASS_NAMES: Record<TodoItemDragHandleTone, string> = {
  onDark:
    "text-gray-300 dark:text-gray-400 hover:text-gray-400 dark:hover:text-gray-300",
  // ダークモードの色は設定の MenuOrderSection の ⠿ と同じ（ライトモードの色は異なる）
  onLight:
    "text-gray-300 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-700",
};

type TodoItemDragHandleProps = {
  attributes: HTMLAttributes<HTMLButtonElement>;
  listeners: DraggableSyntheticListeners;
  tone: TodoItemDragHandleTone;
};

/**
 * dnd-kit ソート用ドラッグハンドルボタン。
 */
export const TodoItemDragHandle = ({
  attributes,
  listeners,
  tone,
}: TodoItemDragHandleProps) => {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      style={{ touchAction: "none" }}
      className={`shrink-0 cursor-grab active:cursor-grabbing select-none ${TONE_CLASS_NAMES[tone]}`}
      aria-label="並び替え"
      onTouchStartCapture={(e) => e.stopPropagation()}
      onMouseDownCapture={(e) => e.stopPropagation()}
    >
      ⠿
    </button>
  );
};
