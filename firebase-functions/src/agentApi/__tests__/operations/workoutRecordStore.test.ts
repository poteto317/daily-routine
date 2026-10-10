/** @jest-environment node */
import {
  appendWorkoutRecord,
  replaceWorkoutRecord,
  listWorkoutRecords,
  removeFromHistory,
} from "../../operations/workout/workoutRecordStore";
import type {
  WorkoutRecord,
  WorkoutHistory,
} from "../../operations/workout/workoutTypes";
const record = (id: string, date = "2026-10-08"): WorkoutRecord => ({
  id,
  date,
  label: "strength",
  exerciseName: "記録時",
  exerciseId: "e",
  weightKg: 10,
  reps: 3,
  createdAt: "2026-10-08T00:00:00Z",
  updatedAt: "2026-10-08T00:00:00Z",
});
it("moves a record to the end of another bucket without mutating either bucket", () => {
  const old = record("old");
  const other = record("other", "2026-10-09");
  const history: WorkoutHistory = { [old.date]: [old], [other.date]: [other] };
  const changed = { ...old, date: other.date };
  expect(replaceWorkoutRecord(history, old.date, changed)).toEqual({
    [other.date]: [other, changed],
  });
  expect(history).toEqual({ [old.date]: [old], [other.date]: [other] });
});
it("keeps replacement position and untouched siblings", () => {
  const first = record("first"),
    second = record("second");
  const history = { [first.date]: [first, second] };
  const changed = { ...first, reps: 8 };
  expect(
    replaceWorkoutRecord(history, first.date, changed)[first.date],
  ).toEqual([changed, second]);
  expect(history[first.date][0]).toBe(first);
});
it("appends immutably and deletes only empty buckets", () => {
  const first = record("first"),
    second = record("second");
  const history = { [first.date]: [first] };
  const appended = appendWorkoutRecord(history, second);
  expect(appended[first.date]).toEqual([first, second]);
  expect(history[first.date]).toEqual([first]);
  expect(removeFromHistory(appended, first.date, first.id)).toEqual({
    [first.date]: [second],
  });
  expect(removeFromHistory(history, first.date, first.id)).toEqual({});
});
it("filters by record fields and sorts ties without changing history", () => {
  const b = record("b"),
    a = record("a"),
    excluded = { ...record("c"), exerciseId: undefined };
  const history = { unrelatedBucket: [b, excluded, a] };
  expect(
    listWorkoutRecords(history, {
      date: a.date,
      label: "strength",
      exerciseId: "e",
    }),
  ).toEqual([a, b]);
  expect(listWorkoutRecords(history, { label: "running" })).toEqual([]);
  expect(history.unrelatedBucket).toEqual([b, excluded, a]);
});
