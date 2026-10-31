import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { downloadJsonFile } from "@/lib/downloadJsonFile";
import { getTodayString } from "@/lib/storage/core";
import {
  BUDGET_ALLOWANCE_IMPORT_MAX_BYTES,
  buildBudgetAllowanceExport,
  getBudgetAllowanceExportFileName,
  parseBudgetAllowanceImport,
} from "./budgetAllowanceTransfer";
import { groupBudgetExpenseItemsByKind } from "./budgetExpenseItemKindGroups";
import {
  getBudgetExpenseItems,
  getBudgetIncomeItems,
  saveBudgetAllowanceItems,
} from "./storage";
import texts from "./locales/ja.json";

export type TransferStatus = {
  kind: "success" | "error";
  message: string;
} | null;

type ItemCounts = { income: number; fixed: number; variable: number };

type UseBudgetAllowanceTransferParams = {
  /** 保存内容が変わった後に呼ばれる。画面の一覧を読み直すために使う */
  onImported: () => void;
};

const transferTexts = texts.allowanceSettings.transfer;

const formatItemCounts = (template: string, counts: ItemCounts): string =>
  template
    .replace("{income}", String(counts.income))
    .replace("{fixed}", String(counts.fixed))
    .replace("{variable}", String(counts.variable));

const errorStatus = (message: string): TransferStatus => ({
  kind: "error",
  message,
});

const readFileText = async (file: File): Promise<string | null> => {
  try {
    return await file.text();
  } catch {
    return null;
  }
};

/** 収入・固定費・変動費の項目のエクスポートとインポートのボタンの処理と状態を持つ。 */
export const useBudgetAllowanceTransfer = ({
  onImported,
}: UseBudgetAllowanceTransferParams) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const [status, setStatus] = useState<TransferStatus>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Strict Mode の再実行で false のまま残らないよう、毎回 true に戻す
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleExport = () => {
    try {
      downloadJsonFile(
        getBudgetAllowanceExportFileName(getTodayString()),
        buildBudgetAllowanceExport(
          getBudgetIncomeItems(),
          getBudgetExpenseItems(),
        ),
      );
      setStatus({ kind: "success", message: transferTexts.exportSuccess });
    } catch {
      setStatus(errorStatus(transferTexts.errors.exportFailed));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importText = (text: string) => {
    const result = parseBudgetAllowanceImport(text);
    if (!result.ok) {
      setStatus(errorStatus(transferTexts.errors[result.reason]));
      return;
    }

    const { incomeItems, expenseItems } = result;
    const { fixedItems, variableItems } =
      groupBudgetExpenseItemsByKind(expenseItems);
    const counts = {
      income: incomeItems.length,
      fixed: fixedItems.length,
      variable: variableItems.length,
    };

    if (
      !window.confirm(
        formatItemCounts(transferTexts.confirmImportTemplate, counts),
      )
    ) {
      return;
    }

    const saveResult = saveBudgetAllowanceItems(incomeItems, expenseItems);
    if (saveResult === "failed") {
      setStatus(errorStatus(transferTexts.errors.saveFailed));
      return;
    }

    onImported();
    if (saveResult === "rollbackFailed") {
      setStatus(errorStatus(transferTexts.errors.partiallySaved));
      return;
    }

    setStatus({
      kind: "success",
      message: formatItemCounts(transferTexts.importSuccessTemplate, counts),
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setStatus(null);
    setIsImporting(true);
    try {
      if (file.size > BUDGET_ALLOWANCE_IMPORT_MAX_BYTES) {
        setStatus(errorStatus(transferTexts.errors.tooLarge));
        return;
      }

      const text = await readFileText(file);
      if (text === null) {
        setStatus(errorStatus(transferTexts.errors.readFailed));
        return;
      }
      // ページを離れた後に確認を出したり保存したりしない
      if (isMountedRef.current) importText(text);
    } finally {
      // 同じファイルをもう一度選べるようにする
      input.value = "";
      setIsImporting(false);
    }
  };

  return {
    fileInputRef,
    status,
    isImporting,
    handleExport,
    handleImportClick,
    handleFileChange,
  };
};
