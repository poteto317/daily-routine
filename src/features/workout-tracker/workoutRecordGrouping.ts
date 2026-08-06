import type { WorkoutRecord } from "@/types/routine";

export type WorkoutRecordDateGroup = {
  date: string;
  records: WorkoutRecord[];
};

/**
 * 記録一覧（作成日時の新しい順）を日付ごとにグルーピングし、
 * 日付の新しい順に並べる。
 */
export const groupWorkoutRecordsByDate = (
  records: WorkoutRecord[],
): WorkoutRecordDateGroup[] => {
  const groups = new Map<string, WorkoutRecord[]>();

  for (const record of records) {
    const existing = groups.get(record.date);
    if (existing) {
      existing.push(record);
    } else {
      groups.set(record.date, [record]);
    }
  }

  return Array.from(groups.entries())
    .map(([date, dateRecords]) => ({ date, records: dateRecords }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
};
