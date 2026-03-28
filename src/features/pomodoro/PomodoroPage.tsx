"use client";

import { CardPanel } from "@/components";
import { PomodoroTimerPanel } from "./components/PomodoroTimerPanel";
import { getProgressPercentage } from "./pomodoroDisplay";
import { POMODORO_PAGE_TEXT } from "./texts";
import { usePomodoroTimer } from "./usePomodoroTimer";

export const PomodoroPage = () => {
  const timer = usePomodoroTimer();
  const progressPercentage = getProgressPercentage(
    timer.timerState,
    timer.timeLeft,
    timer.focusMinutes,
    timer.breakMinutes,
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel className="p-8! mb-0!">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-black text-center">
              {POMODORO_PAGE_TEXT.title}
            </h2>
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              {POMODORO_PAGE_TEXT.betaLabel}
            </span>
          </div>

          {/* 今日の完了数 */}
          <div className="bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-200 dark:to-pink-200 rounded-xl p-4 mb-8">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-900 text-sm mb-1">
                {POMODORO_PAGE_TEXT.todayCompletedLabel}
              </p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-800">
                {timer.completedToday}{" "}
                <span className="text-xl">{POMODORO_PAGE_TEXT.countUnit}</span>
              </p>
            </div>
          </div>
          <PomodoroTimerPanel
            isRunning={timer.isRunning}
            timeLeft={timer.timeLeft}
            progressPercentage={progressPercentage}
            timerState={timer.timerState}
            showSkipToBreak={timer.showSkipToBreak}
            onPause={timer.pauseTimer}
            onReset={timer.resetTimer}
            onSkipToBreak={timer.skipToBreak}
            onStart={timer.startTimer}
          />

          {/* 設定情報 */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-200 rounded-xl p-4">
              <p className="text-gray-600 dark:text-gray-800 text-sm mb-1">
                {POMODORO_PAGE_TEXT.focusTimeLabel}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-black">
                {timer.focusMinutes}{" "}
                <span className="text-sm">{POMODORO_PAGE_TEXT.minutesUnit}</span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-200 rounded-xl p-4">
              <p className="text-gray-600 dark:text-gray-800 text-sm mb-1">
                {POMODORO_PAGE_TEXT.breakTimeLabel}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-black">
                {timer.breakMinutes}{" "}
                <span className="text-sm">{POMODORO_PAGE_TEXT.minutesUnit}</span>
              </p>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-700 text-sm text-center mt-6">
            {POMODORO_PAGE_TEXT.hint}
          </p>
        </CardPanel>
      </main>
    </div>
  );
};
