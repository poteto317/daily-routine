import { createWorkoutTrackerPageStateResult } from "../page/workoutTrackerPageStateResult";

describe("createWorkoutTrackerPageStateResult", () => {
  it("渡されたパラメータをそのまま公開用の形として返す", () => {
    const params = {
      formValues: {
        label: "strength" as const,
        date: "2026-03-01",
        exerciseName: "",
        weightKg: "",
        reps: "",
        sets: "",
        caloriesBurned: "",
      },
      formError: null,
      groups: [],
      setLabel: jest.fn(),
      setDate: jest.fn(),
      setExerciseName: jest.fn(),
      setWeightKg: jest.fn(),
      setReps: jest.fn(),
      setSets: jest.fn(),
      setCaloriesBurned: jest.fn(),
      onSubmitAction: jest.fn(),
      onDeleteRecordAction: jest.fn(),
    };

    expect(createWorkoutTrackerPageStateResult(params)).toEqual(params);
  });
});
