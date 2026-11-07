export { getJournalHistory, saveJournalHistory } from "./storageData";
export {
  getJournalEntries,
  getJournalEntry,
  getTodayJournalEntry,
  saveJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "./storageEntries";
export {
  getJournalEntriesByPeriod,
  getLatestJournalEntry,
} from "./storageQueries";
// 他の機能（同期・データの書き出しと取り込み）に見せるのは、業務日誌の履歴の読み書きだけ
export {
  getWeeklyLogHistory,
  saveWeeklyLogHistory,
} from "./weekly/weeklyLogStorage";
