import textsJson from "./locales/ja.json";

export const STATISTICS_CHART_PANEL_TEXT = {
  noCategoryData: textsJson.chartPanel.noCategoryData,
} as const;

const STATISTICS_CATEGORY_DETAIL_TEXT = {
  completedSuffix: textsJson.chartPanel.completedSuffix,
} as const;

export const formatCategoryCompletionLabel = (
  completed: number,
  total: number,
): string =>
  `${completed} / ${total} ${STATISTICS_CATEGORY_DETAIL_TEXT.completedSuffix}`;
