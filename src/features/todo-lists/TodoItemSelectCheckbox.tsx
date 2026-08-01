"use client";

import texts from "./locales/ja.json";

type TodoItemSelectCheckboxProps = {
  itemId: string;
  title: string;
  isSelected: boolean;
  onToggleSelectAction: (id: string) => void;
};

/**
 * Todo アイテムの選択チェックボックス。
 */
export const TodoItemSelectCheckbox = ({
  itemId,
  title,
  isSelected,
  onToggleSelectAction,
}: TodoItemSelectCheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={isSelected}
    aria-label={texts.list.selectItemLabel.replace("{title}", title)}
    onClick={() => onToggleSelectAction(itemId)}
    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
      isSelected
        ? "bg-teal-500 border-teal-500"
        : "border-gray-300 dark:border-gray-400 hover:border-teal-400"
    }`}
  >
    {isSelected && (
      <span aria-hidden="true" className="text-white text-[10px] leading-none">
        ✓
      </span>
    )}
  </button>
);
