import type { WorkSession } from "@/types/routine";
import workTrackerTexts from "../locales/ja.json";

export const getTotalTimeToday = (sessions: WorkSession[]): number =>
  sessions.reduce((sum, session) => sum + (session.duration || 0), 0);

export const getSessionCountLabel = (count: number): string =>
  `${count} ${workTrackerTexts.todaySummary.sessionUnit}`;
