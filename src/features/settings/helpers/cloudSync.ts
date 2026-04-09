import type { SyncStatus } from "@/features/sync";

type SyncActionKind = "upload" | "download";

type SyncActionViewModel = {
  kind: SyncActionKind;
  label: string;
};

export const SYNC_ACTIONS: SyncActionViewModel[] = [
  { kind: "upload", label: "⬆️ クラウドにアップロード" },
  { kind: "download", label: "⬇️ クラウドからダウンロード" },
];

export const getSyncingStatusLabel = (isSyncing: boolean): string | null => {
  return isSyncing ? "同期中..." : null;
};

export const getFormattedLastSyncTime = (
  lastSyncTime: SyncStatus["lastSyncTime"],
): string | null => {
  if (!lastSyncTime) {
    return null;
  }

  return new Date(lastSyncTime).toLocaleString("ja-JP");
};

export const getSyncActionButtonClassName = (
  actionKind: SyncActionKind,
  isSyncing: boolean,
): string => {
  const baseClassName = "px-4 py-3 rounded-lg font-medium transition-colors";

  if (isSyncing) {
    return `${baseClassName} bg-gray-300 text-gray-500 cursor-not-allowed`;
  }

  if (actionKind === "upload") {
    return `${baseClassName} bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg`;
  }

  return `${baseClassName} bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg`;
};

export const CLOUD_SYNC_MESSAGES = {
  confirmUpload:
    "ローカルのデータをクラウドにアップロードします。クラウドのデータは上書きされます。\n\n続行しますか？",
  uploadSuccess: "✅ クラウドへのアップロードが完了しました",
  uploadError:
    "❌ アップロードに失敗しました。通信環境を確認して再度お試しください",
  confirmDownload:
    "クラウドのデータをダウンロードします。ローカルのデータは上書きされます。\n\n続行しますか？",
  downloadError:
    "❌ ダウンロードに失敗しました。通信環境を確認して再度お試しください",
} as const;
