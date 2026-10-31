"use client";

import type { ChangeEvent, RefObject } from "react";
import type { TransferStatus } from "../useBudgetAllowanceTransfer";
import texts from "../locales/ja.json";

type BudgetAllowanceTransferSectionProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  status: TransferStatus;
  isImporting: boolean;
  onExport: () => void;
  onImportClick: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

const transferTexts = texts.allowanceSettings.transfer;

const STATUS_STYLES = {
  success: { role: "status", className: "text-green-700 dark:text-green-800" },
  error: { role: "alert", className: "text-red-600 dark:text-red-800" },
} as const;

/** 収入・固定費・変動費の項目のエクスポートとインポートのボタンと、結果のメッセージ。 */
export const BudgetAllowanceTransferSection = ({
  fileInputRef,
  status,
  isImporting,
  onExport,
  onImportClick,
  onFileChange,
}: BudgetAllowanceTransferSectionProps) => (
  <section className="mt-8">
    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-900 mb-3">
      {transferTexts.title}
    </h2>
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onExport}
        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        {transferTexts.exportButton}
      </button>
      <button
        type="button"
        onClick={onImportClick}
        disabled={isImporting}
        className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        {isImporting
          ? transferTexts.importingLabel
          : transferTexts.importButton}
      </button>
    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept="application/json,.json"
      aria-label={transferTexts.fileInputLabel}
      onChange={onFileChange}
      className="hidden"
    />
    {status && (
      <p
        role={STATUS_STYLES[status.kind].role}
        className={`mt-3 text-sm ${STATUS_STYLES[status.kind].className}`}
      >
        {status.message}
      </p>
    )}
  </section>
);
