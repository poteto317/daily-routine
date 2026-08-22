import workTrackerTexts from "../locales/ja.json";

export const getTimerStatusLabel = (isRunning: boolean): string =>
  isRunning
    ? workTrackerTexts.timerPanel.running
    : workTrackerTexts.timerPanel.stopped;

export const getTimerGradientClassName = (isRunning: boolean): string =>
  isRunning ? "from-green-500 to-teal-500" : "from-blue-500 to-indigo-500";
