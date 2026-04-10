import { getPomodoroPrimaryButtonLabel, getStateColor } from "../helpers";
import {
  formatPomodoroTimer,
  getStateText,
  type TimerState,
} from "../pomodoroDisplay";
import { POMODORO_TIMER_PANEL_TEXT } from "../texts";

type PomodoroTimerPanelProps = {
  isRunning: boolean;
  progressPercentage: number;
  showSkipToBreak: boolean;
  timerState: TimerState;
  timeLeft: number;
  onPause: () => void;
  onReset: () => void;
  onSkipToBreak: () => void;
  onStart: () => void;
};

export const PomodoroTimerPanel = ({
  isRunning,
  progressPercentage,
  showSkipToBreak,
  timerState,
  timeLeft,
  onPause,
  onReset,
  onSkipToBreak,
  onStart,
}: PomodoroTimerPanelProps) => {
  const stateColor = getStateColor(timerState);
  const stateText = getStateText(timerState);
  return (
    <div
      className={`relative bg-linear-to-br ${stateColor} rounded-3xl p-6 sm:p-12 mb-8 shadow-2xl`}
    >
      <div className="text-center">
        <p className="text-white text-lg sm:text-xl font-semibold mb-4">
          {stateText}
        </p>
        <p className="text-white text-5xl sm:text-6xl md:text-8xl font-bold mb-8 font-mono tracking-wider">
          {formatPomodoroTimer(timeLeft)}
        </p>

        <div className="w-full bg-white/30 rounded-full h-3 mb-6">
          <div
            className="bg-white rounded-full h-3 transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          <button
            onClick={isRunning ? onPause : onStart}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {getPomodoroPrimaryButtonLabel(isRunning)}
          </button>
          <button
            onClick={onReset}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-white/30 transition-colors"
          >
            {POMODORO_TIMER_PANEL_TEXT.resetLabel}
          </button>
          {showSkipToBreak && (
            <button
              onClick={onSkipToBreak}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-white/20 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-white/30 transition-colors"
            >
              {POMODORO_TIMER_PANEL_TEXT.skipBreakLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
