"use client";

import { CardPanel } from "@/components";
import { ProgressBar } from "@/components";
import { TrainDelayNotification } from "@/components/TrainDelayNotification";
import { DaySelector } from "./DaySelector";
import { CategoryFilter } from "./CategoryFilter";
import { HOME_TOOLBAR_TEXT } from "./homeToolbarPresentation";
import type { HomeToolbarProps } from "./homeTypes";

/** ホーム画面のツールバー（日付・追加ボタン・遅延通知・フィルター・進捗） */
export const HomeToolbar = ({
  view,
  display,
  trainDelays,
  onAddRoutineAction,
  showAddButton,
}: HomeToolbarProps) => (
  <CardPanel>
    <div className="flex items-center justify-between mb-4">
      {view.currentDate && (
        <p className="text-gray-600 dark:text-gray-800">
          {view.currentDate}
          {view.isTodayHoliday && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-200 text-red-800 dark:text-red-900">
              {HOME_TOOLBAR_TEXT.holiday}
            </span>
          )}
        </p>
      )}
      {showAddButton && (
        <button
          onClick={onAddRoutineAction}
          className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          aria-label={HOME_TOOLBAR_TEXT.addRoutineAriaLabel}
        >
          <span className="text-3xl font-bold leading-none">+</span>
        </button>
      )}
    </div>

    {trainDelays.length > 0 && <TrainDelayNotification delays={trainDelays} />}

    <DaySelector
      viewMode={view.viewMode}
      onViewModeChangeAction={view.setViewModeAction}
      sortedDaysAndHoliday={view.sortedDaysAndHoliday}
    />
    <CategoryFilter
      filterCategory={view.filterCategory}
      onFilterChangeAction={view.setFilterCategoryAction}
    />
    <ProgressBar
      completedMinutes={display.completedMinutes}
      totalMinutes={display.totalMinutes}
      progressPercentage={display.progressPercentage}
    />
  </CardPanel>
);
