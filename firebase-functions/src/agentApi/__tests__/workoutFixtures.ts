import type { OperationContext } from "../operations/types";
export const strength = {
  id: "s",
  name: "ベンチ",
  label: "strength",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};
export const running = {
  ...strength,
  id: "r",
  name: "ジョグ",
  label: "running",
};
export const oldRecord = {
  id: "old",
  date: "2026-10-01",
  label: "strength",
  exerciseId: "s",
  exerciseName: "昔のベンチ",
  weightKg: 60,
  reps: 10,
  sets: 3,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};
export const ctx = (
  overrides: Partial<OperationContext> = {},
): OperationContext => ({
  data: {
    workoutExercises: [strength, running],
    workoutRecordHistory: { "2026-10-01": [oldRecord] },
  },
  query: {},
  body: {},
  now: new Date("2026-10-08T00:00:00.000Z"),
  ...overrides,
});
