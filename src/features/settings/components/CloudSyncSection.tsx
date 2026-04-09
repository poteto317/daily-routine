import type { SyncStatus } from "@/features/sync";
import {
  getFormattedLastSyncTime,
  getSyncActionButtonClassName,
  getSyncingStatusLabel,
  SYNC_ACTIONS,
} from "../helpers/cloudSync";
import texts from "../locales/ja.json";

type Props = {
  syncStatus: SyncStatus;
  handleUploadToCloud: () => Promise<void>;
  handleDownloadFromCloud: () => Promise<void>;
};

export const CloudSyncSection = ({
  syncStatus,
  handleUploadToCloud,
  handleDownloadFromCloud,
}: Props) => {
  const syncingStatusLabel = getSyncingStatusLabel(syncStatus.isSyncing);
  const lastSyncTimeText = getFormattedLastSyncTime(syncStatus.lastSyncTime);

  return (
    <div className="border-t pt-6 dark:border-gray-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-4">
        {texts.cloudSync.title}
      </h3>
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-900">
          {texts.cloudSync.warningMessage}
        </p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-700 mb-4">
        {texts.cloudSync.description}
      </p>

      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-800">
            {texts.cloudSync.statusLabel}
          </span>
          {syncingStatusLabel && (
            <span className="text-xs text-blue-600 dark:text-blue-700 animate-pulse">
              {syncingStatusLabel}
            </span>
          )}
        </div>
        {lastSyncTimeText && (
          <p className="text-xs text-gray-600 dark:text-gray-700">
            {texts.cloudSync.lastSyncPrefix} {lastSyncTimeText}
          </p>
        )}
        {syncStatus.hasRemoteChanges && (
          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-200 border border-yellow-300 rounded text-xs text-yellow-800 dark:text-yellow-900">
            {texts.cloudSync.remoteChangesMessage}
          </div>
        )}
        {syncStatus.hasLocalChanges && (
          <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-200 border border-emerald-300 rounded text-xs text-emerald-800 dark:text-emerald-900">
            {texts.cloudSync.localChangesMessage}
          </div>
        )}
        {syncStatus.error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-200 border border-red-300 rounded text-xs text-red-800 dark:text-red-900">
            {texts.cloudSync.errorPrefix} {syncStatus.error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SYNC_ACTIONS.map((action) => (
          <button
            key={action.kind}
            onClick={
              action.kind === "upload"
                ? handleUploadToCloud
                : handleDownloadFromCloud
            }
            disabled={syncStatus.isSyncing}
            className={getSyncActionButtonClassName(
              action.kind,
              syncStatus.isSyncing,
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-600 mt-3">
        {texts.cloudSync.hint}
      </p>
    </div>
  );
};
