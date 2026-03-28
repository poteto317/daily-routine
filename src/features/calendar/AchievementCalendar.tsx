"use client";

import { CardPanel } from "@/components";
import { CalendarDetailPanel } from "./components/CalendarDetailPanel";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarLegend } from "./components/CalendarLegend";
import { CalendarMonthNavigation } from "./components/CalendarMonthNavigation";
import { CalendarWeekHeader } from "./components/CalendarWeekHeader";
import { useAchievementCalendarState } from "./useAchievementCalendarState";
import calendarTexts from "./locales/ja.json";

export const AchievementCalendar = () => {
  const state = useAchievementCalendarState();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel className="mb-0!">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 mb-4">
            {calendarTexts.page.title}
          </h2>

          <CalendarMonthNavigation
            year={state.year}
            month={state.month}
            onGoToToday={state.goToToday}
            onNextMonth={state.goToNextMonth}
            onPreviousMonth={state.goToPreviousMonth}
          />
          <CalendarWeekHeader />
          <CalendarGrid
            year={state.year}
            month={state.month}
            monthHistory={state.monthHistory}
            pomodoroHistory={state.pomodoroHistory}
            selectedDate={state.selectedDate}
            onDateClick={state.handleDateClick}
          />
          <CalendarLegend />
          <CalendarDetailPanel
            selectedDate={state.selectedDate}
            selectedHistory={state.selectedHistory}
          />
        </CardPanel>
      </main>
    </div>
  );
};
