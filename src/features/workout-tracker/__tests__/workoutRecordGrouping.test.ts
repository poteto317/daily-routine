import type { StrengthWorkoutRecord } from "@/types/routine";
import { groupWorkoutRecordsByDate } from "../workoutRecordGrouping";

const createRecord = (
  overrides: Partial<StrengthWorkoutRecord> = {},
): StrengthWorkoutRecord =>
  ({
    id: "id-1",
    date: "2026-03-01",
    label: "strength",
    exerciseName: "ベンチプレス",
    weightKg: 60,
    reps: 10,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  }) satisfies StrengthWorkoutRecord;

describe("groupWorkoutRecordsByDate", () => {
  it("空配列なら空配列を返す", () => {
    expect(groupWorkoutRecordsByDate([])).toEqual([]);
  });

  it("同じ日付のレコードを1グループにまとめる", () => {
    const records = [
      createRecord({ id: "a", date: "2026-03-01" }),
      createRecord({ id: "b", date: "2026-03-01" }),
    ];

    const groups = groupWorkoutRecordsByDate(records);

    expect(groups).toHaveLength(1);
    expect(groups[0].date).toBe("2026-03-01");
    expect(groups[0].records.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("日付の新しい順にグループを並べる", () => {
    const records = [
      createRecord({ id: "a", date: "2026-03-01" }),
      createRecord({ id: "b", date: "2026-03-03" }),
      createRecord({ id: "c", date: "2026-03-02" }),
    ];

    const groups = groupWorkoutRecordsByDate(records);

    expect(groups.map((g) => g.date)).toEqual([
      "2026-03-03",
      "2026-03-02",
      "2026-03-01",
    ]);
  });

  it("グループ内のレコードの並び順は入力順を保つ", () => {
    const records = [
      createRecord({ id: "first", date: "2026-03-01" }),
      createRecord({ id: "second", date: "2026-03-01" }),
      createRecord({ id: "third", date: "2026-03-01" }),
    ];

    const groups = groupWorkoutRecordsByDate(records);

    expect(groups[0].records.map((r) => r.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
