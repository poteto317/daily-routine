import { formatTimerLong } from "@/lib/storage";
import {
  getTimerGradientClassName,
  getTimerStatusLabel,
} from "../helpers";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  isRunning: boolean;
  elapsedTime: number;
  showInputForm: boolean;
  onStart: () => void;
  onStop: () => void;
};

export const WorkTrackerTimerPanel = ({
  isRunning,
  elapsedTime,
  showInputForm,
  onStart,
  onStop,
}: Props) => {
  return (
    <div
      className={`relative bg-linear-to-br ${getTimerGradientClassName(isRunning)} rounded-3xl p-6 sm:p-12 mb-8 shadow-2xl transition-all duration-500`}
    >
      <div className="text-center">
        <p className="text-white text-lg sm:text-xl font-semibold mb-4">
          {getTimerStatusLabel(isRunning)}
        </p>
        <p className="text-white text-5xl sm:text-6xl md:text-8xl font-bold mb-8 font-mono tracking-wider">
          {formatTimerLong(elapsedTime)}
        </p>
        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <button
              onClick={onStart}
              disabled={showInputForm}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {workTrackerTexts.timerPanel.start}
            </button>
          ) : (
            <button
              onClick={onStop}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {workTrackerTexts.timerPanel.stop}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
