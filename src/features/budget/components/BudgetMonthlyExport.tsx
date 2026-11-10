import { useState } from "react";
import type { BudgetCategory, Expense } from "@/types/routine";
import { downloadJsonFile } from "@/lib/downloadJsonFile";
import {
  buildBudgetMonthlyExport,
  getBudgetMonthlyExportFileName,
} from "../budgetMonthlyExport";
import texts from "../locales/ja.json";

type BudgetMonthlyExportProps = {
  month: string;
  expenses: Expense[];
  categories: BudgetCategory[];
};

/** 月別の書き出し操作と、その開始・失敗の通知を表示する。 */
export const BudgetMonthlyExport = ({
  month,
  expenses,
  categories,
}: BudgetMonthlyExportProps) => {
  const [status, setStatus] = useState<"idle" | "started" | "error">("idle");
  const data = buildBudgetMonthlyExport(month, expenses, categories);
  const isEmpty = data.budgetData.expenses[month].length === 0;
  const exportTexts = texts.monthlyExport;

  const handleExport = () => {
    try {
      downloadJsonFile(getBudgetMonthlyExportFileName(month), data);
      setStatus("started");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        disabled={isEmpty}
        onClick={handleExport}
        className="w-full px-4 py-2 bg-green-100 dark:bg-green-200 text-green-800 dark:text-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {exportTexts.button}
      </button>
      {isEmpty && (
        <p className="text-sm text-gray-600 dark:text-gray-700 mt-2">
          {exportTexts.empty}
        </p>
      )}
      {status === "started" && (
        <p
          role="status"
          className="text-sm text-green-700 dark:text-green-800 mt-2"
        >
          {exportTexts.started}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-800 mt-2">
          {exportTexts.failed}
        </p>
      )}
    </div>
  );
};
