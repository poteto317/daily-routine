import type { WorkSession } from "@/types/routine";
import { getTodayString } from "@/lib/storage/core";
import { getWorkSessionHistory, saveWorkSessionHistory } from "./storageData";

export const getTodayWorkSessions = (): WorkSession[] => {
  const history = getWorkSessionHistory();
  return history[getTodayString()] || [];
};

export const addWorkSession = (session: WorkSession): void => {
  const history = getWorkSessionHistory();
  const today = getTodayString();
  history[today] = history[today] || [];
  history[today].push(session);
  saveWorkSessionHistory(history);
};

export const updateWorkSession = (
  sessionId: string,
  updates: Partial<WorkSession>,
): void => {
  const history = getWorkSessionHistory();
  const today = getTodayString();
  if (!history[today]) return;
  const index = history[today].findIndex((session) => session.id === sessionId);
  if (index === -1) return;
  history[today][index] = { ...history[today][index], ...updates };
  saveWorkSessionHistory(history);
};

export const deleteWorkSession = (sessionId: string): void => {
  const history = getWorkSessionHistory();
  const today = getTodayString();
  if (!history[today]) return;
  history[today] = history[today].filter((session) => session.id !== sessionId);
  saveWorkSessionHistory(history);
};

export const getAllWorkSessions = (): WorkSession[] => {
  const history = getWorkSessionHistory();
  const allSessions = Object.values(history).flat();
  return allSessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const getSessionsByTemplateId = (templateId: string): WorkSession[] => {
  return getAllWorkSessions().filter(
    (session) => session.workTemplateId === templateId,
  );
};

export const getSessionsByWorkName = (workName: string): WorkSession[] => {
  return getAllWorkSessions().filter(
    (session) => session.workName === workName,
  );
};
