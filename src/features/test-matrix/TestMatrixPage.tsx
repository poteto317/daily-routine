"use client";

import { useAuth } from "@/features/auth";
import { DetailPanel } from "./DetailPanel";
import { MatrixCategoryCard } from "./MatrixCategoryCard";
import testMatrixTexts from "./locales/ja.json";
import { TestMatrixStatusLegend } from "./TestMatrixStatusLegend";
import { TestMatrixSummaryBar } from "./TestMatrixSummaryBar";
import { TestMatrixToolbar } from "./TestMatrixToolbar";
import { useTestMatrixPageState } from "./useTestMatrixPageState";

export const TestMatrixPage = () => {
  const { isAdmin, loading, isAdminLoading } = useAuth();
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

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{testMatrixTexts.page.loading}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-red-50 dark:bg-red-100 border border-red-200 dark:border-red-300 rounded-xl p-6 text-center">
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
      <TestMatrixSummaryBar
        totalCount={totalCount}
        okCount={okCount}
        ngCount={ngCount}
        uncheckedCount={uncheckedCount}
        progressPct={progressPct}
      />

      {/* Toolbar */}
      <TestMatrixToolbar
        collapseAll={collapseAll}
        filterStatus={filterStatus}
        onCollapseAll={handleCollapseAll}
        onChangeFilter={setFilterStatus}
        onReset={resetAll}
      />

      {/* Status legend */}
      <TestMatrixStatusLegend />

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
