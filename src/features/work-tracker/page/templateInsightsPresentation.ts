import workTrackerTexts from "../locales/ja.json";

type TemplateStatsSummary = {
  count: number;
  averageDuration: number;
  bestDuration: number;
  latestDuration: number;
  trend: "improving" | "declining" | "stable" | "first";
};

type InsightCard = {
  id: string;
  title: string;
  value: string;
  className: string;
  valueClassName: string;
};

export const EMPTY_TEMPLATE_STATS: TemplateStatsSummary = {
  count: 0,
  averageDuration: 0,
  bestDuration: 0,
  latestDuration: 0,
  trend: "first",
};

export const getTemplateInsightCards = (
  stats: TemplateStatsSummary,
  formatDuration: (seconds: number) => string,
): InsightCard[] => [
  {
    id: "count",
    title: "回数",
    value: `${stats.count}`,
    className: "text-center p-2 bg-blue-50 dark:bg-blue-100 rounded",
    valueClassName: "text-lg font-bold text-blue-600 dark:text-blue-800",
  },
  {
    id: "best",
    title: "ベスト",
    value: formatDuration(stats.bestDuration),
    className: "text-center p-2 bg-green-50 dark:bg-green-100 rounded",
    valueClassName: "text-lg font-bold text-green-600 dark:text-green-800",
  },
  {
    id: "average",
    title: "平均",
    value: formatDuration(Math.round(stats.averageDuration)),
    className: "text-center p-2 bg-purple-50 dark:bg-purple-100 rounded",
    valueClassName: "text-lg font-bold text-purple-600 dark:text-purple-800",
  },
];

export const getTrendMessage = (params: {
  stats: TemplateStatsSummary;
  elapsedTime: number;
}): { icon: string; message: string; className: string } | null => {
  const { stats, elapsedTime } = params;
  const { improving, declining, newRecord } = workTrackerTexts.templateInsights;

  if (stats.trend === "improving") {
    return {
      icon: improving.icon,
      message: improving.message,
      className:
        "flex items-center gap-2 text-green-600 dark:text-green-800 text-sm",
    };
  }
  if (stats.trend === "declining" && elapsedTime > stats.averageDuration) {
    return {
      icon: declining.icon,
      message: declining.message,
      className:
        "flex items-center gap-2 text-orange-600 dark:text-orange-800 text-sm",
    };
  }
  if (elapsedTime < stats.bestDuration) {
    return {
      icon: newRecord.icon,
      message: newRecord.message,
      className:
        "flex items-center gap-2 text-blue-600 dark:text-blue-800 text-sm font-bold",
    };
  }
  return null;
};
