import type { TransferOptions, TransferStatus } from "../state/constants";

type ButtonViewState = {
  disabled: boolean;
  className: string;
  label: string;
};

type DataOptionItem = {
  key: keyof TransferOptions;
  label: string;
};

export const hasSelectedOption = (options: TransferOptions): boolean => {
  return Object.values(options).some((value) => value);
};

export const getExportButtonViewState = (
  exportStatus: TransferStatus,
  importStatus: TransferStatus,
  options: TransferOptions,
): ButtonViewState => {
  const hasSelection = hasSelectedOption(options);
  const disabled = importStatus === "success" || !hasSelection;

  if (disabled) {
    return {
      disabled,
      className: "bg-gray-400 text-white cursor-not-allowed",
      label: "💾 選択したデータをエクスポート",
    };
  }

  if (exportStatus === "success") {
    return {
      disabled,
      className: "bg-green-600 text-white",
      label: "✓ エクスポート完了！",
    };
  }

  if (exportStatus === "error") {
    return {
      disabled,
      className: "bg-red-600 text-white",
      label: "✗ エクスポート失敗",
    };
  }

  return {
    disabled,
    className: "bg-indigo-600 text-white hover:bg-indigo-700",
    label: "💾 選択したデータをエクスポート",
  };
};

export const getImportButtonViewState = (
  importStatus: TransferStatus,
  options: TransferOptions,
): ButtonViewState => {
  const hasSelection = hasSelectedOption(options);
  const disabled = importStatus === "success" || !hasSelection;

  if (importStatus === "success") {
    return {
      disabled,
      className: "bg-green-600 text-white cursor-wait",
      label: "✓ インポート完了！ページをリロード中...",
    };
  }

  if (importStatus === "error") {
    return {
      disabled,
      className: "bg-red-600 text-white",
      label: "✗ インポート失敗",
    };
  }

  if (!hasSelection) {
    return {
      disabled,
      className: "bg-gray-400 text-white cursor-not-allowed",
      label: "📥 選択したデータをインポート",
    };
  }

  return {
    disabled,
    className: "bg-purple-600 text-white hover:bg-purple-700",
    label: "📥 選択したデータをインポート",
  };
};

export const DATA_MANAGEMENT_MESSAGES = {
  alertNoSelection: "インポートする項目を選択してください",
  confirmImport: (types: string[]) =>
    `以下のデータをインポートします（現在のデータは上書きされます）：\n\n${types.join(", ")}\n\n続行しますか？`,
} as const;

export const DATA_OPTION_ITEMS: DataOptionItem[] = [
  { key: "routines", label: "ルーティン登録データ" },
  { key: "progress", label: "今日の進捗データ" },
  { key: "history", label: "達成カレンダー・統計データ（全履歴）" },
  { key: "settings", label: "アプリ設定" },
];

export const getUpdatedTransferOptions = (
  options: TransferOptions,
  key: keyof TransferOptions,
  checked: boolean,
): TransferOptions => {
  return { ...options, [key]: checked };
};
