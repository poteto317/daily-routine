"use client";

import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { HTMLAttributes } from "react";

type TodoItemDragHandleProps = {
  attributes: HTMLAttributes<HTMLButtonElement>;
  listeners: DraggableSyntheticListeners;
};

/**
 * dnd-kit ソート用ドラッグハンドルボタン。
 */
export const TodoItemDragHandle = ({
  attributes,
  listeners,
}: TodoItemDragHandleProps) => {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      style={{ touchAction: "none" }}
      className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400 select-none"
      aria-label="並び替え"
      onTouchStartCapture={(e) => e.stopPropagation()}
      onMouseDownCapture={(e) => e.stopPropagation()}
    >
      ⠿
    </button>
  );
};
