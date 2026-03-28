"use client";

import { CardPanel } from "@/components";
import { WeightTrackerHistoryList } from "./page/components/WeightTrackerHistoryList";
import { WeightTrackerTodayCard } from "./page/components/WeightTrackerTodayCard";
import { useWeightTrackerState } from "./page/useWeightTrackerState";
import { WEIGHT_TRACKER_PAGE_TEXT } from "./page/helpers";

/**
 * 体重記録ページコンポーネント
 * 日々の体重を記録・管理する機能を提供
 * @returns {JSX.Element}
 */
export const WeightTrackerPage = () => {
  const {
    today,
    todayRecord,
    weightInput,
    notesInput,
    showForm,
    recentRecords,
    setWeightInput,
    setNotesInput,
    setShowForm,
    handleSaveWeight,
    handleCancelForm,
    handleDeleteRecord,
  } = useWeightTrackerState();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {WEIGHT_TRACKER_PAGE_TEXT.title}
          </h1>

          <WeightTrackerTodayCard
            today={today}
            todayRecord={todayRecord}
            showForm={showForm}
            weightInput={weightInput}
            notesInput={notesInput}
            onEdit={() => setShowForm(true)}
            onWeightChange={setWeightInput}
            onNotesChange={setNotesInput}
            onSave={handleSaveWeight}
            onCancel={handleCancelForm}
          />

          <WeightTrackerHistoryList
            today={today}
            recentRecords={recentRecords}
            onDeleteRecord={handleDeleteRecord}
          />
        </CardPanel>
      </main>
    </div>
  );
};
