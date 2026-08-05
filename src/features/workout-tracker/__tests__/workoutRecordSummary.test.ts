import type { WorkoutRecord } from "@/types/routine";
import { formatWorkoutRecordSummary } from "../workoutRecordSummary";

describe("formatWorkoutRecordSummary", () => {
  it("strengthはセット数なしなら「重量×回数」の形式", () => {
    const record: WorkoutRecord = {
      id: "1",
      date: "2026-03-01",
      label: "strength",
      exerciseName: "ベンチプレス",
      weightKg: 60,
      reps: 10,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };

    expect(formatWorkoutRecordSummary(record)).toBe("60kg × 10回");
  });

  it("strengthはセット数ありなら「重量×回数×セット数」の形式", () => {
    const record: WorkoutRecord = {
      id: "1",
      date: "2026-03-01",
      label: "strength",
      exerciseName: "ベンチプレス",
      weightKg: 60,
      reps: 10,
      sets: 3,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };

    expect(formatWorkoutRecordSummary(record)).toBe("60kg × 10回 × 3セット");
  });

  it("runningは消費カロリーのみの形式", () => {
    const record: WorkoutRecord = {
      id: "1",
      date: "2026-03-01",
      label: "running",
      exerciseName: "朝のジョグ",
      caloriesBurned: 320,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };

    expect(formatWorkoutRecordSummary(record)).toBe("320kcal");
  });
});
