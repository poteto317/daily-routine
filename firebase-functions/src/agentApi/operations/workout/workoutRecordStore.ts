import type { SyncDocData } from "../../syncDoc";
import { readObject } from "../dataAccess";
import { notFound } from "../../errors";
import type {
  WorkoutHistory,
  WorkoutRecord,
  WorkoutLabel,
} from "./workoutTypes";
export const readWorkoutHistory = (data: SyncDocData): WorkoutHistory =>
  readObject(data, "workoutRecordHistory") as WorkoutHistory;

export const findWorkoutRecord = (
  history: WorkoutHistory,
  id: string | undefined,
) => {
  for (const [key, records] of Object.entries(history)) {
    const record = records.find((record) => record.id === id);
    if (record) return { key, record };
  }
  throw notFound("運動記録");
};
export const removeFromHistory = (
  history: WorkoutHistory,
  key: string,
  id: string,
): WorkoutHistory => {
  const next = { ...history };
  const remaining = history[key].filter((record) => record.id !== id);
  if (remaining.length) next[key] = remaining;
  else delete next[key];
  return next;
};

export const appendWorkoutRecord = (
  history: WorkoutHistory,
  record: WorkoutRecord,
): WorkoutHistory => ({
  ...history,
  [record.date]: [...(history[record.date] ?? []), record],
});
export const replaceWorkoutRecord = (
  history: WorkoutHistory,
  key: string,
  record: WorkoutRecord,
): WorkoutHistory =>
  record.date === key
    ? {
        ...history,
        [key]: history[key].map((item) =>
          item.id === record.id ? record : item,
        ),
      }
    : appendWorkoutRecord(removeFromHistory(history, key, record.id), record);

export const listWorkoutRecords = (
  history: WorkoutHistory,
  filters: { date?: string; label?: WorkoutLabel; exerciseId?: string },
): WorkoutRecord[] =>
  Object.values(history)
    .flat()
    .filter(
      (record) =>
        (filters.date === undefined || record.date === filters.date) &&
        (filters.label === undefined || record.label === filters.label) &&
        (filters.exerciseId === undefined ||
          record.exerciseId === filters.exerciseId),
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
