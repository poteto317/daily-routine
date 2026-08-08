/**
 * アクションメニュー内のボタン項目（編集・下に追加・インデント上げ下げ）が
 * 共通で使うclassName。削除ボタンは配色が異なるため別扱い。
 */
const ACTION_MENU_BUTTON_BASE_CLASS =
  "w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600";

export const ACTION_MENU_BUTTON_CLASS = `${ACTION_MENU_BUTTON_BASE_CLASS} flex items-center gap-2`;

/** disabled状態を持つボタン項目（インデント上げ下げ）用のclassName */
export const ACTION_MENU_DISABLED_BUTTON_CLASS = `${ACTION_MENU_BUTTON_BASE_CLASS} disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`;
