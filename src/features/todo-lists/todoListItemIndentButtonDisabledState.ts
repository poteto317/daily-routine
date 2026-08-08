/**
 * インデント上げ/下げボタンの disabled 判定。
 * sortModeActive中は生配列の隣接関係が画面表示と乖離しうるため、
 * インデント値に関わらず両方とも無効化する。
 * TodoItemIndentButtons（デスクトップ常時表示）と
 * TodoItemActionMenuIndentControls（アクションメニュー内）の
 * 両方から共有される。
 */
export const isOutdentButtonDisabled = (
  currentIndent: number,
  sortModeActive: boolean,
): boolean => currentIndent === 0 || sortModeActive;

export const isIndentButtonDisabled = (
  currentIndent: number,
  maxIndent: number,
  sortModeActive: boolean,
): boolean => currentIndent >= maxIndent || sortModeActive;
