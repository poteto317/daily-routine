import type { getSyncStatus } from "@/features/sync";
import texts from "./texts";
import { getHeaderSyncButtonTitle } from "./helpers";

type SyncStatus = ReturnType<typeof getSyncStatus>;

type HeaderSyncButtonProps = {
  mode: "upload" | "download";
  syncStatus: SyncStatus;
  onSyncAction: () => Promise<void> | void;
};

export const HeaderSyncButton = ({
  mode,
  syncStatus,
  onSyncAction,
}: HeaderSyncButtonProps) => {
  const isUpload = mode === "upload";
  const shouldHighlightUpload =
    !syncStatus.isSyncing && mode === "upload" && syncStatus.hasLocalChanges;
  const shouldHighlightDownload =
    !syncStatus.isSyncing && mode === "download" && syncStatus.hasRemoteChanges;
  const shouldHighlight = shouldHighlightUpload || shouldHighlightDownload;

  return (
    <button
      onClick={onSyncAction}
      disabled={syncStatus.isSyncing}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm text-gray-700 dark:text-gray-800 ${
        shouldHighlight
          ? "border-amber-400 bg-amber-50 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-100 dark:hover:bg-amber-200"
          : "border-gray-200 bg-white hover:bg-gray-100 dark:bg-slate-100 dark:border-slate-300 dark:hover:bg-slate-200"
      }`}
      aria-label={
        isUpload
          ? texts.headerSyncButton.uploadAriaLabel
          : texts.headerSyncButton.downloadAriaLabel
      }
      title={getHeaderSyncButtonTitle(mode, syncStatus)}
    >
      {shouldHighlight && (
        <span
          className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-100"
          aria-hidden="true"
        />
      )}
      {syncStatus.isSyncing ? (
        <svg
          className="w-6 h-6 text-blue-600 dark:text-blue-700 animate-spin"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757 6.636 6.636m11.728 0-2.121 2.121M8.757 15.243l-2.121 2.121" />
        </svg>
      ) : (
        <svg
          className={
            isUpload
              ? "w-5 h-5 text-emerald-600 dark:text-emerald-700"
              : "w-5 h-5 text-sky-600 dark:text-sky-700"
          }
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isUpload ? (
            <>
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M5 20h14" />
            </>
          ) : (
            <>
              <path d="M12 4v12" />
              <path d="m17 11-5 5-5-5" />
              <path d="M5 20h14" />
            </>
          )}
        </svg>
      )}
    </button>
  );
};
