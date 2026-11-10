"use client";

import { WeeklyLogCard } from "./components/WeeklyLogCard";
import { useWeeklyLogState } from "./useWeeklyLogState";

/**
 * 週ごとの業務日誌ページ。ハンバーガーメニューの独立した項目から開く。
 */
export const WeeklyLogPage = () => {
  const state = useWeeklyLogState();
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <WeeklyLogCard state={state} />
      </main>
    </div>
  );
};
