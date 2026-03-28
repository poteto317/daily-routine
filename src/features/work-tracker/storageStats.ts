import { calculateSessionStats } from "@/lib/storage/core";
import {
  getSessionsByTemplateId,
  getSessionsByWorkName,
} from "./storageSessions";

export const getTemplateStats = (templateId: string) => {
  const durations = getSessionsByTemplateId(templateId).map(
    (session) => session.duration || 0,
  );
  return calculateSessionStats(durations);
};

export const getWorkNameStats = (workName: string) => {
  const durations = getSessionsByWorkName(workName).map(
    (session) => session.duration || 0,
  );
  return calculateSessionStats(durations);
};
