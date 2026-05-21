"use client";

import texts from "./locales/ja.json";

type AddItemPositionToggleButtonProps = {
  addItemPosition: "first" | "last" | undefined;
  onToggle: (nextPosition: "first" | "last") => void;
};

/**
 * アイテム追加位置（先頭/末尾）の切り替えボタン。
 * 現在の位置を表示し、クリックで反対の位置に切り替える。
 */
export const AddItemPositionToggleButton = ({
  addItemPosition,
  onToggle,
}: AddItemPositionToggleButtonProps) => {
  const isFirst = addItemPosition === "first";
  const nextPosition = isFirst ? "last" : "first";

  return (
    <button
      type="button"
      onClick={() => onToggle(nextPosition)}
      className={`text-xs transition-colors ${
        isFirst
          ? "text-teal-600 dark:text-teal-500 hover:text-teal-700"
          : "text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700"
      }`}
    >
      {isFirst ? texts.list.addItemPositionFirst : texts.list.addItemPositionLast}
    </button>
  );
};
