"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { BudgetExpenseItemKind } from "@/types/routine";
import { formatCurrency } from "../utils/format";
import texts from "../locales/ja.json";

type Item = { id: string; name: string; amount: number };

type Props<T extends Item> = {
  item: T;
  isEditing: boolean;
  editingName: string;
  editingAmount: string;
  onChangeEditingName: (value: string) => void;
  onChangeEditingAmount: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (item: T) => void;
  onDelete: (item: T) => void;
  kind?: BudgetExpenseItemKind;
  onToggleKind?: (itemId: string) => void;
};

/** 収入/固定費/変動費 共通の項目1行（表示/名前・金額のインライン編集、削除、任意でkindトグル）。 */
export const BudgetAllowanceItemRow = <T extends Item>({
  item,
  isEditing,
  editingName,
  editingAmount,
  onChangeEditingName,
  onChangeEditingAmount,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
  kind,
  onToggleKind,
}: Props<T>) => {
  // 名前・金額の2フィールドを編集するため、片方から片方へフォーカス移動する
  // だけでも一方のフィールドのblurが発生する。blur時に自動commitすると、
  // フィールド間を移動しただけで編集セッションが閉じてしまうため、
  // BudgetExpenseListItem と同様に明示的な保存/キャンセルボタンで確定する
  // （blur委譲によるcommitは行わない）。
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
      onCommitEdit();
    }
    if (e.key === "Escape") {
      onCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={editingName}
            onChange={(e) => onChangeEditingName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={texts.allowanceSettings.editNamePlaceholder}
            className="flex-1 min-w-0 text-sm px-2 py-1 border-b-2 border-blue-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <input
            type="number"
            value={editingAmount}
            onChange={(e) => onChangeEditingAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={texts.allowanceSettings.editAmountPlaceholder}
            aria-label={texts.allowanceSettings.amountLabel}
            className="w-28 shrink-0 text-sm px-2 py-1 border-b-2 border-blue-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCommitEdit}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors"
          >
            {texts.allowanceSettings.saveLabel}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 px-2 py-1"
          >
            {texts.allowanceSettings.cancelButton}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 break-words">
          {item.name}
        </span>
        <p className="text-base font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(item.amount)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {kind !== undefined && onToggleKind && (
          <button
            type="button"
            onClick={() => onToggleKind(item.id)}
            className="text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors"
            aria-label={`${item.name}の分類を切り替える`}
          >
            {kind === "fixed"
              ? texts.allowanceSettings.fixedLabel
              : texts.allowanceSettings.variableLabel}
          </button>
        )}
        <button
          type="button"
          onClick={() => onStartEdit(item)}
          className="text-gray-300 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-base leading-none"
          aria-label={`${item.name}を編集`}
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-base leading-none"
          aria-label={`${item.name}を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
