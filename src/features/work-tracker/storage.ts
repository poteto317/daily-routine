export {
  getWorkTemplates,
  saveWorkTemplates,
  getWorkSessionHistory,
  saveWorkSessionHistory,
} from "./storageData";
export {
  addWorkTemplate,
  updateWorkTemplate,
  updateWorkTemplateLastUsed,
  deleteWorkTemplate,
  getOrCreateWorkTemplate,
} from "./storageTemplates";
export {
  getTodayWorkSessions,
  addWorkSession,
  updateWorkSession,
  deleteWorkSession,
  getAllWorkSessions,
  getSessionsByTemplateId,
  getSessionsByWorkName,
} from "./storageSessions";
export { getTemplateStats, getWorkNameStats } from "./storageStats";
