import { MOOD_OPTIONS, type WorkSession } from "@/types/routine";

type SessionStats = {
  count: number;
  bestDuration: number;
};

export const findMoodOption = (mood: WorkSession["mood"]) => {
  return MOOD_OPTIONS.find((option) => option.value === mood);
};

export const isSessionImprovement = (
  session: WorkSession,
  previousSessions: WorkSession[],
): boolean => {
  const sessionIndex = previousSessions.findIndex(
    (item) => item.id === session.id,
  );

  return (
    sessionIndex > 0 &&
    (session.duration || 0) <
      (previousSessions[sessionIndex - 1]?.duration || Infinity)
  );
};

export const isSessionNewRecord = (
  session: WorkSession,
  stats: SessionStats,
): boolean => {
  return (session.duration || 0) === stats.bestDuration && stats.count > 1;
};
