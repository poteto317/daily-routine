"use client";

import texts from "./locales/ja.json";
import { ACTION_MENU_BUTTON_CLASS } from "./todoItemActionMenuButtonClassName";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の編集ボタン */
export const TodoItemActionMenuEditButton = ({ onClick }: Props) => (
  <button type="button" onClick={onClick} className={ACTION_MENU_BUTTON_CLASS}>
    ✏️ {texts.list.editItemLabel}
  </button>
);
