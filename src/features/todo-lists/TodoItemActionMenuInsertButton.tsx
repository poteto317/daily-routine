"use client";

import texts from "./locales/ja.json";
import { ACTION_MENU_BUTTON_CLASS } from "./todoItemActionMenuButtonClassName";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の「下に追加」ボタン */
export const TodoItemActionMenuInsertButton = ({ onClick }: Props) => (
  <button type="button" onClick={onClick} className={ACTION_MENU_BUTTON_CLASS}>
    ＋↓ {texts.list.insertAfterLabel}
  </button>
);
