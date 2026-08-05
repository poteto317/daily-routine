import { type NewWorkoutRecordInput, type WorkoutRecord } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import { getWorkoutRecordHistory, saveWorkoutRecordHistory } from "./storageData";

export type { NewWorkoutRecordInput };

export const addWorkoutRecord = (
  input: NewWorkoutRecordInput,
): WorkoutRecord => {
  const history = getWorkoutRecordHistory();
  const now = new Date().toISOString();
  const record = {
    ...input,
    id: generateId("workout"),
    createdAt: now,
    updatedAt: now,
  } satisfies WorkoutRecord;

  history[input.date] = [...(history[input.date] ?? []), record];
  saveWorkoutRecordHistory(history);

  return record;
};

export const deleteWorkoutRecord = (date: string, recordId: string): void => {
  const history = getWorkoutRecordHistory();
  if (!history[date]) return;

  const remaining = history[date].filter((record) => record.id !== recordId);
  if (remaining.length > 0) {
    history[date] = remaining;
  } else {
    delete history[date];
  }

  saveWorkoutRecordHistory(history);
};

export const getAllWorkoutRecords = (): WorkoutRecord[] => {
  return Object.values(getWorkoutRecordHistory())
    .flat()
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};
