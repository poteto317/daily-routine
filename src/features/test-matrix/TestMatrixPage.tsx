"use client";

import { useAuth } from "@/features/auth";
import { DetailPanel } from "./DetailPanel";
import { MatrixCategoryCard } from "./MatrixCategoryCard";
import testMatrixTexts from "./locales/ja.json";
import { getCollapseAllButtonLabel, getTotalItemsLabel } from "./helpers";
import { useTestMatrixPageState } from "./useTestMatrixPageState";
import type { CheckStatus } from "./types";

export const TestMatrixPage = () => {
  const { isAdmin, loading } = useAuth();
  const {
    categories,
    collapseAll,
    collapsedIds,
    detailData,
    filterStatus,
    overviewStats,
    selectedItem,
    selectedItemId,
    setFilterStatus,
    setSelectedItemId,
    toggleStatus,
    updateNote,
    toggleDetailStatus,
    updateDetailNote,
    toggleCollapse,
    handleCollapseAll,
    resetAll,
  } = useTestMatrixPageState({
    resetConfirmMessage: testMatrixTexts.page.resetConfirmMessage,
  });

  const { totalCount, okCount, ngCount, uncheckedCount, progressPct } =
    overviewStats;

  if (!loading && !isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-red-50 dark:bg-red-100 border border-red-200 rounded-xl p-6 text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-800 mb-2">
            {testMatrixTexts.page.accessDeniedTitle}
          </h2>
          <p className="text-sm text-red-600 dark:text-red-700">
            {testMatrixTexts.page.accessDeniedDescription}
          </p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{testMatrixTexts.page.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {testMatrixTexts.page.title}
        </h1>
        <p className="text-sm text-gray-500">{testMatrixTexts.page.subtitle}</p>
      </div>

      {/* Summary bar */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {testMatrixTexts.page.progressLabel}
            </span>
            <span className="text-lg font-bold text-blue-600">
              {progressPct}%
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
              ✅ {okCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
              ❌ {ngCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
              ⬜ {uncheckedCount}
            </span>
            <span className="text-gray-400">
              {getTotalItemsLabel(totalCount)}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-500 bg-blue-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={handleCollapseAll}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        >
          {getCollapseAllButtonLabel(collapseAll)}
        </button>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as CheckStatus | "all")
          }
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white"
        >
          {testMatrixTexts.page.filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={resetAll}
          className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 bg-white hover:bg-red-50 transition-colors ml-auto"
        >
          {testMatrixTexts.page.reset}
        </button>
      </div>

      {/* Status legend */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-gray-700">
            {testMatrixTexts.page.statusLabel}
          </span>
          <span className="text-gray-600">{testMatrixTexts.page.statusOk}</span>
          <span className="text-gray-600">{testMatrixTexts.page.statusNg}</span>
          <span className="text-gray-600">{testMatrixTexts.page.statusNa}</span>
          <span className="text-gray-600">
            {testMatrixTexts.page.statusUnchecked}
          </span>
        </div>
      </div>

      {/* Matrix tables */}
      <div className="space-y-4">
        {categories.map((category) => (
          <MatrixCategoryCard
            key={category.id}
            category={category}
            detailData={detailData}
            filterStatus={filterStatus}
            isCollapsed={collapsedIds.has(category.id)}
            onToggleCollapse={toggleCollapse}
            onToggleStatus={toggleStatus}
            onUpdateNote={updateNote}
            onOpenDetail={setSelectedItemId}
          />
        ))}
      </div>

      {/* Detail panel */}
      {selectedItemId && selectedItem && (
        <DetailPanel
          itemId={selectedItemId}
          itemLabel={selectedItem.label}
          cases={detailData[selectedItemId] || []}
          onClose={() => setSelectedItemId(null)}
          onToggleStatus={toggleDetailStatus}
          onUpdateNote={updateDetailNote}
        />
      )}
    </div>
  );
};
