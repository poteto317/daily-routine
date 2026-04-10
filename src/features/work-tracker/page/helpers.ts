import { type WorkSession, type WorkTemplate } from "@/types/routine";
import { getSessionsByTemplateId, getTemplateStats } from "@/lib/storage";
import workTrackerTexts from "../locales/ja.json";
import {
  findMoodOption,
  isSessionImprovement,
  isSessionNewRecord,
} from "./sessionHistoryMeta";

// =============================================================================
// Existing helpers
// =============================================================================

export const getTotalTimeToday = (sessions: WorkSession[]): number => {
  return sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
};

export const getFilteredTemplates = (
  templates: WorkTemplate[],
  query: string,
): WorkTemplate[] => {
  return templates
    .filter((template) =>
      template.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);
};

// =============================================================================
// Session History helpers
// =============================================================================

export const getSessionHistoryMeta = (session: WorkSession) => {
  const moodOption = findMoodOption(session.mood);
  const stats = getTemplateStats(session.workTemplateId);
  const previousSessions = getSessionsByTemplateId(session.workTemplateId);
  const isImprovement = isSessionImprovement(session, previousSessions);
  const isNewRecord = isSessionNewRecord(session, stats);

  return { moodOption, stats, isImprovement, isNewRecord };
};

export const formatWorkSessionTimeRange = (
  startTime: string,
  endTime?: string,
): string => {
  const start = new Date(startTime).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!endTime) {
    return start;
  }

  const end = new Date(endTime).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${start} - ${end}`;
};

export const formatWorkSessionStatsSummary = (params: {
  bestDuration: string;
  averageDuration: string;
  count: number;
}): string => {
  const { bestDuration, averageDuration, count } = params;
  const { bestLabel, averageLabel, countLabel, countSuffix } =
    workTrackerTexts.sessionHistoryItem;

  return `${bestLabel}: ${bestDuration} / ${averageLabel}: ${averageDuration} / ${countLabel}: ${count}${countSuffix}`;
};

// =============================================================================
// Template Input helpers
// =============================================================================

export const shouldShowTemplateDropdown = (
  showTemplateDropdown: boolean,
  workName: string,
): boolean => {
  return showTemplateDropdown && workName.length > 0;
};

export const getTemplateStatsSummaryLabel = (
  count: number,
  bestDurationText: string,
): string => {
  const { bestPrefix, countSuffix } = workTrackerTexts.templateInput;
  return `${count}${countSuffix} | ${bestPrefix} ${bestDurationText}`;
};

export const formatNewWorkNameLabel = (workName: string): string =>
  `「${workName}」`;

// =============================================================================
// Timer Panel helpers
// =============================================================================

export const getTimerStatusLabel = (isRunning: boolean): string =>
  isRunning
    ? workTrackerTexts.timerPanel.running
    : workTrackerTexts.timerPanel.stopped;

export const getTimerGradientClassName = (isRunning: boolean): string =>
  isRunning ? "from-green-500 to-teal-500" : "from-blue-500 to-indigo-500";

// =============================================================================
// Today Summary helpers
// =============================================================================

export const getSessionCountLabel = (count: number): string =>
  `${count} ${workTrackerTexts.todaySummary.sessionUnit}`;

// =============================================================================
// Template Insights helpers
// =============================================================================

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
): InsightCard[] => {
  return [
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
};

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
