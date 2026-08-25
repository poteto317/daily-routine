"use client";

import {
  isIndentButtonDisabled,
  isOutdentButtonDisabled,
} from "./todoListItemIndentButtonDisabledState";
import { ACTION_MENU_DISABLED_BUTTON_CLASS } from "./todoItemActionMenuButtonClassName";
import texts from "./locales/ja.json";

type Props = {
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  onOutdent: () => void;
  onIndent: () => void;
};

/**
 * アクションメニュー内のインデント上げ/下げボタン。
 * sortModeActive中は生配列の隣接関係が画面表示と乖離しうるため無効化する
 * （TodoItemIndentButtons.tsx と同じ理由）。
 */
export const TodoItemActionMenuIndentControls = ({
  currentIndent,
  maxIndent,
  sortModeActive,
  onOutdent,
  onIndent,
}: Props) => (
  <>
    <button
      type="button"
      onClick={onOutdent}
      disabled={isOutdentButtonDisabled(currentIndent, sortModeActive)}
      className={ACTION_MENU_DISABLED_BUTTON_CLASS}
    >
      ← {texts.list.outdentLabel}
    </button>
    <button
      type="button"
      onClick={onIndent}
      disabled={isIndentButtonDisabled(
        currentIndent,
        maxIndent,
        sortModeActive,
      )}
      className={ACTION_MENU_DISABLED_BUTTON_CLASS}
    >
      → {texts.list.indentLabel}
    </button>
  </>
);
