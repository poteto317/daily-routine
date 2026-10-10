/** @jest-environment node */
import {
  workoutExerciseOperations as exercises,
  workoutRecordOperations as records,
} from "../../operations/workout";
import { ctx } from "../workoutFixtures";
it("exercise patch rejects unknown keys before lookup, then missing IDs before empty patches", () => {
  expect(() =>
    exercises.update(ctx({ id: "missing", body: { label: "running" } })),
  ).toThrow(expect.objectContaining({ code: "unknown_field" }));
  expect(() => exercises.update(ctx({ id: "missing", body: {} }))).toThrow(
    expect.objectContaining({ code: "not_found" }),
  );
});
it("record patch checks lookup before unknown fields or an empty patch", () => {
  for (const body of [{ unexpected: true }, {}])
    expect(() => records.update(ctx({ id: "missing", body }))).toThrow(
      expect.objectContaining({ code: "not_found" }),
    );
});
it("record creation checks date and reference before label-specific fields", () => {
  expect(() =>
    records.create(
      ctx({ body: { date: "bad", exerciseId: "missing", unexpected: true } }),
    ),
  ).toThrow("date:");
  expect(() =>
    records.create(
      ctx({
        body: { date: "2026-10-08", exerciseId: "missing", unexpected: true },
      }),
    ),
  ).toThrow("exerciseId:");
});
it("failed validation does not mutate the input data", () => {
  const context = ctx({ id: "old", body: { date: "2026-10-09", reps: 0 } });
  const original = structuredClone(context.data);
  expect(() => records.update(context)).toThrow();
  expect(context.data).toEqual(original);
});
