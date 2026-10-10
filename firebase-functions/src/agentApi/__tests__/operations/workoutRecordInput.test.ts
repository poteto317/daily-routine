/** @jest-environment node */
import { parseWorkoutRecordCreateInput } from "../../operations/workout/workoutRecordCreateInput";
import { parseWorkoutRecordPatchInput } from "../../operations/workout/workoutRecordPatchInput";
import { strength, running } from "../workoutFixtures";
const resolve = (id: string) =>
  id === "s"
    ? { ...strength, label: "strength" as const }
    : { ...running, label: "running" as const };
const create = {
  date: "2026-10-08",
  exerciseId: "s",
  weightKg: 1.5,
  reps: 0.5,
};
it("accepts positive fractional measurements and omits absent sets", () => {
  const input = parseWorkoutRecordCreateInput(create, resolve);
  expect(input).toEqual({
    ...create,
    label: "strength",
    exerciseName: strength.name,
  });
  expect(input).not.toHaveProperty("sets");
});
it.each([0, -1, Infinity, NaN, "1", null])(
  "rejects non-positive or non-number measurements: %s",
  (weightKg) => {
    expect(() =>
      parseWorkoutRecordCreateInput({ ...create, weightKg }, resolve),
    ).toThrow("weightKg:");
  },
);
it("rejects invalid sets before other strength measurements on create", () => {
  expect(() =>
    parseWorkoutRecordCreateInput({ ...create, sets: 0, weightKg: 0 }, resolve),
  ).toThrow("sets:");
});
it("only resolves an exercise when a patch supplies its ID", () => {
  const missing = jest.fn(() => {
    throw new Error("missing exercise");
  });
  expect(
    parseWorkoutRecordPatchInput({ reps: 2 }, "strength", missing),
  ).toMatchObject({ reps: 2 });
  expect(missing).not.toHaveBeenCalled();
  expect(() =>
    parseWorkoutRecordPatchInput({ exerciseId: "s" }, "strength", missing),
  ).toThrow("missing exercise");
});
it("rejects label changes and unrelated measurements", () => {
  expect(() =>
    parseWorkoutRecordPatchInput({ exerciseId: "r" }, "strength", resolve),
  ).toThrow("異なる種類");
  expect(() =>
    parseWorkoutRecordPatchInput({ reps: 1 }, "running", resolve),
  ).toThrow(expect.objectContaining({ code: "unknown_field" }));
});
it("allows sets deletion only in a patch and accepts running decimals", () => {
  expect(
    parseWorkoutRecordPatchInput({ sets: null }, "strength", resolve),
  ).toMatchObject({ sets: null });
  expect(() =>
    parseWorkoutRecordCreateInput({ ...create, sets: null }, resolve),
  ).toThrow("sets:");
  expect(
    parseWorkoutRecordPatchInput({ caloriesBurned: 0.1 }, "running", resolve),
  ).toMatchObject({ caloriesBurned: 0.1 });
});

it("accepts 200-character exercise IDs after trimming in create and patch bodies", () => {
  const id = "a".repeat(200);
  const lookup = jest.fn(() => ({
    ...strength,
    id,
    label: "strength" as const,
  }));
  expect(
    parseWorkoutRecordCreateInput({ ...create, exerciseId: ` ${id} ` }, lookup),
  ).toHaveProperty("exerciseId", id);
  expect(
    parseWorkoutRecordPatchInput({ exerciseId: ` ${id} ` }, "strength", lookup),
  ).toHaveProperty("exercise.id", id);
  expect(lookup.mock.calls).toEqual([[id], [id]]);
});

it("rejects 201-character exercise IDs before reference lookup in create and patch bodies", () => {
  const lookup = jest.fn(() => ({ ...strength, label: "strength" as const }));
  const exerciseId = "a".repeat(201);
  expect(() =>
    parseWorkoutRecordCreateInput({ ...create, exerciseId }, lookup),
  ).toThrow(expect.objectContaining({ code: "invalid_field" }));
  expect(() =>
    parseWorkoutRecordPatchInput({ exerciseId }, "strength", lookup),
  ).toThrow(expect.objectContaining({ code: "invalid_field" }));
  expect(lookup).not.toHaveBeenCalled();
});
