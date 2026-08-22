import { getSessionsByTemplateId, getTemplateStats } from "@/lib/storage";
import type { WorkSession } from "@/types/routine";
import workTrackerTexts from "../locales/ja.json";
import {
  findMoodOption,
  isSessionImprovement,
  isSessionNewRecord,
} from "./sessionHistoryMeta";

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
  if (!endTime) return start;

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
