"use client";

import texts from "./locales/ja.json";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の削除ボタン */
export const TodoItemActionMenuDeleteButton = ({ onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
  >
    🗑️ {texts.list.deleteLabel}
  </button>
);
