/** @jest-environment node */
import {
  parseExerciseIdQuery,
  parseWorkoutLabelQuery,
} from "../../operations/workout/workoutQueryParams";
it("distinguishes absent filters and normalizes only exercise IDs", () => {
  expect(parseExerciseIdQuery(undefined)).toBeUndefined();
  expect(parseWorkoutLabelQuery(undefined)).toBeUndefined();
  expect(parseExerciseIdQuery(" e ")).toBe("e");
  expect(parseWorkoutLabelQuery("strength")).toBe("strength");
  expect(parseWorkoutLabelQuery("running")).toBe("running");
});
it.each(["", " strength", "other"])("rejects invalid label %s", (value) => {
  expect(() => parseWorkoutLabelQuery(value)).toThrow(
    expect.objectContaining({ code: "invalid_query" }),
  );
});
it.each([" ", "a".repeat(201)])("rejects invalid exercise ID", (value) => {
  expect(() => parseExerciseIdQuery(value)).toThrow(
    expect.objectContaining({ code: "invalid_query" }),
  );
});
it("allows the maximum ID length after trimming", () =>
  expect(parseExerciseIdQuery(` ${"a".repeat(200)} `)).toHaveLength(200));
