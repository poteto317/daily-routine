"use client";

import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { BudgetExpenseItemKind } from "@/types/routine";
import texts from "../locales/ja.json";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  nameInput: string;
  amountInput: string;
  onChangeName: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  kind?: BudgetExpenseItemKind;
  onChangeKind?: (kind: BudgetExpenseItemKind) => void;
};

/** 収入/固定費/変動費 共通の項目作成フォーム（名前+金額、支出項目のみkind切替も持つ）。 */
export const BudgetAllowanceItemForm = ({
  inputRef,
  nameInput,
  amountInput,
  onChangeName,
  onChangeAmount,
  onCreate,
  onCancel,
  kind,
  onChangeKind,
}: Props) => (
  <div className="mb-4 p-4 bg-blue-50 dark:bg-gray-200 border border-blue-200 dark:border-gray-400 rounded-xl">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-900 mb-3">
      {texts.allowanceSettings.createTitle}
    </p>
    <input
      ref={inputRef}
      type="text"
      value={nameInput}
      onChange={(e) => onChangeName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
          onCreate();
        }
        if (e.key === "Escape") {
          onCancel();
        }
      }}
      placeholder={texts.allowanceSettings.namePlaceholder}
      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg bg-white dark:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
    />
    <input
      type="number"
      value={amountInput}
      onChange={(e) => onChangeAmount(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
          onCreate();
        }
        if (e.key === "Escape") {
          onCancel();
        }
      }}
      placeholder={texts.allowanceSettings.amountPlaceholder}
      aria-label={texts.allowanceSettings.amountLabel}
      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg bg-white dark:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
    />
    {kind !== undefined && onChangeKind && (
      <div
        role="radiogroup"
        aria-label={texts.allowanceSettings.kindLabel}
        className="flex gap-2 mb-3"
      >
        <button
          type="button"
          role="radio"
          aria-checked={kind === "fixed"}
          onClick={() => onChangeKind("fixed")}
          className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${
            kind === "fixed"
              ? "border-blue-500 bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-900"
              : "border-gray-300 dark:border-gray-400 bg-white dark:bg-white text-gray-600 dark:text-gray-700"
          }`}
        >
          {texts.allowanceSettings.fixedLabel}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={kind === "variable"}
          onClick={() => onChangeKind("variable")}
          className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${
            kind === "variable"
              ? "border-blue-500 bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-900"
              : "border-gray-300 dark:border-gray-400 bg-white dark:bg-white text-gray-600 dark:text-gray-700"
          }`}
        >
          {texts.allowanceSettings.variableLabel}
        </button>
      </div>
    )}
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCreate}
        disabled={!nameInput.trim()}
        className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {texts.allowanceSettings.createButton}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-600 px-3 py-2"
      >
        {texts.allowanceSettings.cancelButton}
      </button>
    </div>
  </div>
);
