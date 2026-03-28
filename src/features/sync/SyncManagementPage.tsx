"use client";

import { CardPanel } from "@/components";
import texts from "./locales/ja.json";
import { useSyncManagementPageState } from "./useSyncManagementPageState";

const formatUploadedAt = (uploadedAt: number): string => {
  return new Date(uploadedAt).toLocaleString("ja-JP");
};

export const SyncManagementPage = () => {
  const {
    activeSnapshotId,
    error,
    isLoading,
    snapshots,
    handleApply,
    handleDelete,
    loadSnapshots,
  } = useSyncManagementPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <CardPanel>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
                {texts.snapshotManager.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">
                {texts.snapshotManager.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void loadSnapshots();
              }}
              disabled={isLoading}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
            >
              {texts.snapshotManager.refreshButton}
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">
              {texts.snapshotManager.loading}
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-3xl mb-2">☁️</p>
              <p className="text-sm font-medium">
                {texts.snapshotManager.empty}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snapshot, index) => {
                const isBusy = activeSnapshotId === snapshot.id;

                return (
                  <div
                    key={snapshot.id}
                    className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {texts.snapshotManager.snapshotLabel.replace(
                            "{index}",
                            String(index + 1),
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {texts.snapshotManager.uploadedAtLabel.replace(
                            "{datetime}",
                            formatUploadedAt(snapshot.uploadedAt),
                          )}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 break-all">
                          {texts.snapshotManager.deviceLabel.replace(
                            "{deviceId}",
                            snapshot.deviceId,
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            void handleApply(snapshot.id);
                          }}
                          className="text-sm px-3 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-60"
                        >
                          {texts.snapshotManager.applyButton}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            void handleDelete(snapshot.id);
                          }}
                          className="text-sm px-3 py-2 rounded-lg border border-red-300 text-red-600 bg-white hover:bg-red-50 disabled:opacity-60"
                        >
                          {texts.snapshotManager.deleteButton}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardPanel>
      </main>
    </div>
  );
};
