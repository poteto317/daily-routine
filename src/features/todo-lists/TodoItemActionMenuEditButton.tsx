"use client";

import texts from "./locales/ja.json";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の編集ボタン */
export const TodoItemActionMenuEditButton = ({ onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
  >
    ✏️ {texts.list.editItemLabel}
  </button>
);
