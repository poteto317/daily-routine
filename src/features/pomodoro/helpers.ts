/**
 * Pomodoro feature UI helper functions
 */

import type { TimerState } from "./pomodoroDisplay";
import { POMODORO_TIMER_PANEL_TEXT } from "./texts";

/**
 * タイマー状態に応じたTailwind CSSグラデーションクラスを返す
 */
export const getStateColor = (timerState: TimerState): string => {
  if (timerState === "focus") return "from-red-500 to-orange-500";
  if (timerState === "break") return "from-green-500 to-teal-500";
  return "from-blue-500 to-indigo-500";
};

/**
 * Get pomodoro primary button label based on running state
 */
export const getPomodoroPrimaryButtonLabel = (isRunning: boolean): string => {
  return isRunning
    ? POMODORO_TIMER_PANEL_TEXT.pauseLabel
    : POMODORO_TIMER_PANEL_TEXT.startLabel;
};
