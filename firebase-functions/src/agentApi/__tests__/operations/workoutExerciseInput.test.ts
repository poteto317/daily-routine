/** @jest-environment node */
import {
  parseWorkoutExerciseCreateInput,
  parseWorkoutExerciseNamePatch,
} from "../../operations/workout/workoutExerciseInput";
import { assertUniqueExerciseName } from "../../operations/workout/workoutExerciseRules";
const exercises = [
  {
    id: "e",
    name: "種目",
    label: "strength" as const,
    createdAt: "old",
    updatedAt: "old",
  },
];
it("trims names while keeping the requested label", () => {
  expect(
    parseWorkoutExerciseCreateInput({ name: " 種目 ", label: "running" }),
  ).toEqual({ name: "種目", label: "running" });
  expect(parseWorkoutExerciseNamePatch({ name: " 次 " })).toBe("次");
});
it.each(["", " ", "あ".repeat(101)])("rejects invalid names", (name) => {
  expect(() =>
    parseWorkoutExerciseCreateInput({ name, label: "strength" }),
  ).toThrow();
});
it("accepts 100 characters and rejects empty patches", () => {
  expect(
    parseWorkoutExerciseNamePatch({ name: "あ".repeat(100) }),
  ).toHaveLength(100);
  expect(() => parseWorkoutExerciseNamePatch({})).toThrow(
    expect.objectContaining({ code: "empty_patch" }),
  );
});
it("uniqueness is scoped to label and excludes the edited exercise", () => {
  expect(() => assertUniqueExerciseName(exercises, "種目", "strength")).toThrow(
    expect.objectContaining({ code: "invalid_field" }),
  );
  expect(() =>
    assertUniqueExerciseName(exercises, "種目", "running"),
  ).not.toThrow();
  expect(() =>
    assertUniqueExerciseName(exercises, "種目", "strength", "e"),
  ).not.toThrow();
});
