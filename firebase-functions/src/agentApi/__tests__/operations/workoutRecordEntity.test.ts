/** @jest-environment node */
import { it, expect } from "@jest/globals";
import {
  createWorkoutRecord,
  updateWorkoutRecord,
} from "../../operations/workout/workoutRecordEntity";
import type {
  WorkoutRecord,
  WorkoutExercise,
} from "../../operations/workout/workoutTypes";
const record: WorkoutRecord = {
  id: "r",
  date: "2026-10-08",
  label: "strength",
  exerciseId: "e",
  exerciseName: "記録時",
  weightKg: 10,
  reps: 2,
  sets: 3,
  createdAt: "old",
  updatedAt: "old",
};
const exercise: WorkoutExercise = {
  id: "e",
  name: "改名後",
  label: "strength",
  createdAt: "old",
  updatedAt: "new",
};
const now = new Date("2026-10-09T00:00:00Z");
it("keeps the recorded name for the same reference and updates only requested values", () => {
  const result = updateWorkoutRecord(record, { exercise, reps: 4 }, now);
  expect(result).toEqual({ ...record, reps: 4, updatedAt: now.toISOString() });
  expect(record.reps).toBe(2);
});
it("takes a new snapshot only when switching exercise", () => {
  expect(
    updateWorkoutRecord(record, { exercise: { ...exercise, id: "new" } }, now),
  ).toMatchObject({
    exerciseId: "new",
    exerciseName: "改名後",
    createdAt: "old",
  });
});
it("distinguishes omitted sets from explicit removal without mutating the old record", () => {
  expect(updateWorkoutRecord(record, {}, now)).toHaveProperty("sets", 3);
  expect(updateWorkoutRecord(record, { sets: null }, now)).not.toHaveProperty(
    "sets",
  );
  expect(record).toHaveProperty("sets", 3);
});

it("generates metadata without changing the supplied strength values", () => {
  const input = Object.freeze({
    label: "strength" as const,
    date: "2026-10-09",
    exerciseId: "e",
    exerciseName: "記録時",
    weightKg: 1.5,
    reps: 2,
  });
  expect(createWorkoutRecord(input, "new", now)).toEqual({
    ...input,
    id: "new",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
  expect(input).not.toHaveProperty("id");
  expect(input).not.toHaveProperty("sets");
});

it("creates and updates running measurements without altering its snapshot", () => {
  const created = createWorkoutRecord(
    {
      label: "running",
      date: "2026-10-09",
      exerciseId: "run",
      exerciseName: "ラン",
      caloriesBurned: 0.5,
    },
    "r",
    now,
  );
  const updated = updateWorkoutRecord(
    Object.freeze(created),
    { caloriesBurned: 10 },
    new Date("2026-10-10T00:00:00Z"),
  );
  expect(updated).toEqual({
    ...created,
    caloriesBurned: 10,
    updatedAt: "2026-10-10T00:00:00.000Z",
  });
  expect(created).toHaveProperty("caloriesBurned", 0.5);
});

// 旧記録では省略可能でも、新規記録の契約では種目IDが必須。
type CreateInput = Parameters<typeof createWorkoutRecord>[0];
const acceptsCreateInput = (input: CreateInput): CreateInput => input;
const verifyCreateContract = () => {
  // @ts-expect-error 新規記録の種目ID欠損を型チェックで拒否する
  acceptsCreateInput({
    label: "running",
    date: "2026-10-09",
    exerciseName: "ラン",
    caloriesBurned: 1,
  });
};
void verifyCreateContract;
