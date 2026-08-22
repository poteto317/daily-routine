import type { ViewMode } from "./page/types";
import textsJson from "./locales/ja.json";

export const STATISTICS_PERIOD_PREVIOUS_LABEL =
  textsJson.periodControls.previousLabel;
export const STATISTICS_PERIOD_NEXT_LABEL = textsJson.periodControls.nextLabel;

const STATISTICS_PERIOD_CONTROLS_TEXT = {
  currentWeek: textsJson.modeSelector.periodControls.currentWeek,
  currentMonth: textsJson.modeSelector.periodControls.currentMonth,
} as const;

export const getStatisticsPeriodLabel = (params: {
  viewMode: ViewMode;
  weekStart: string;
  weekEnd: string;
  year: number;
  month: number;
}): string => {
  const { viewMode, weekStart, weekEnd, year, month } = params;

  return viewMode === "week"
    ? `${weekStart} 〜 ${weekEnd}`
    : `${year}年 ${month}月`;
};

export const getCurrentPeriodLabel = (viewMode: ViewMode): string =>
  viewMode === "week"
    ? STATISTICS_PERIOD_CONTROLS_TEXT.currentWeek
    : STATISTICS_PERIOD_CONTROLS_TEXT.currentMonth;
