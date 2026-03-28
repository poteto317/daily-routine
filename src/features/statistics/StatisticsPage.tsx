"use client";

import { CardPanel } from "@/components";
import "./page/chartRegistration";
import { StatisticsCategoryDetailList } from "./page/components/StatisticsCategoryDetailList";
import { StatisticsChartPanel } from "./page/components/StatisticsChartPanel";
import { StatisticsModeSelector } from "./page/components/StatisticsModeSelector";
import { StatisticsPeriodControls } from "./page/components/StatisticsPeriodControls";
import { StatisticsSummaryCards } from "./page/components/StatisticsSummaryCards";
import {
  getStatisticsPeriodLabel,
  STATISTICS_PAGE_DESCRIPTION,
  STATISTICS_PAGE_TITLE,
} from "./helpers";
import { useStatisticsChartData } from "./page/useStatisticsChartData";
import { useStatisticsPageState } from "./page/useStatisticsPageState";

export const StatisticsPage = () => {
  const {
    viewMode,
    setViewMode,
    year,
    month,
    weeklyStats,
    monthlyStats,
    categoryStats,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
  } = useStatisticsPageState();

  const { weeklyChartData, monthlyChartData, categoryChartData } =
    useStatisticsChartData({
      weeklyStats,
      monthlyStats,
      categoryStats,
    });

  const periodLabel = getStatisticsPeriodLabel({
    viewMode,
    weekStart: weeklyStats.weekStart,
    weekEnd: weeklyStats.weekEnd,
    year,
    month,
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CardPanel>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900">
                {STATISTICS_PAGE_TITLE}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-700 mt-1">
                {STATISTICS_PAGE_DESCRIPTION}
              </p>
            </div>
          </div>

          <StatisticsModeSelector viewMode={viewMode} onChange={setViewMode} />

          {viewMode !== "category" && (
            <StatisticsPeriodControls
              viewMode={viewMode}
              periodLabel={periodLabel}
              onPrevious={goToPreviousPeriod}
              onNext={goToNextPeriod}
              onToday={goToToday}
            />
          )}

          <StatisticsSummaryCards
            viewMode={viewMode}
            weeklyStats={weeklyStats}
            monthlyStats={monthlyStats}
            categoryStats={categoryStats}
            year={year}
            month={month}
          />

          <StatisticsChartPanel
            viewMode={viewMode}
            weeklyChartData={weeklyChartData}
            monthlyChartData={monthlyChartData}
            categoryChartData={categoryChartData}
            hasCategoryData={categoryStats.length > 0}
          />

          {viewMode === "category" && categoryStats.length > 0 && (
            <StatisticsCategoryDetailList categoryStats={categoryStats} />
          )}
        </CardPanel>
      </div>
    </div>
  );
};
