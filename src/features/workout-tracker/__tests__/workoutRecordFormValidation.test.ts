import {
  validateRunningWorkoutForm,
  validateStrengthWorkoutForm,
  validateWorkoutRecordForm,
} from "../workoutRecordFormValidation";
import texts from "../locales/ja.json";

const baseValues = {
  date: "2026-03-01",
  exerciseName: "ベンチプレス",
  weightKg: "",
  reps: "",
  sets: "",
  caloriesBurned: "",
};

describe("validateWorkoutRecordForm", () => {
  describe("strength", () => {
    it("種目名・重量・回数が揃っていれば有効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        weightKg: "60",
        reps: "10",
      });

      expect(result).toEqual({
        valid: true,
        record: {
          label: "strength",
          date: "2026-03-01",
          exerciseName: "ベンチプレス",
          weightKg: 60,
          reps: 10,
        },
      });
    });

    it("セット数を指定すると記録に含まれる", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        weightKg: "60",
        reps: "10",
        sets: "3",
      });

      expect(result).toEqual({
        valid: true,
        record: expect.objectContaining({ sets: 3 }),
      });
    });

    it("種目名が空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        exerciseName: "  ",
        weightKg: "60",
        reps: "10",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorExerciseNameRequired,
      });
    });

    it("重量が空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        reps: "10",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorWeightRequired,
      });
    });

    it("日付が空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        date: "",
        weightKg: "60",
        reps: "10",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorDateRequired,
      });
    });

    it("重量が0以下なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        weightKg: "0",
        reps: "10",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorWeightRequired,
      });
    });

    it("回数が空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        weightKg: "60",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorRepsRequired,
      });
    });

    it("セット数が数値でなければ無視される（未指定扱い）", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "strength",
        weightKg: "60",
        reps: "10",
        sets: "abc",
      });

      expect(result.valid).toBe(true);
      expect(result.valid && result.record).not.toHaveProperty("sets");
    });
  });

  describe("running", () => {
    it("種目名・消費カロリーが揃っていれば有効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "running",
        exerciseName: "朝のジョグ",
        caloriesBurned: "300",
      });

      expect(result).toEqual({
        valid: true,
        record: {
          label: "running",
          date: "2026-03-01",
          exerciseName: "朝のジョグ",
          caloriesBurned: 300,
        },
      });
    });

    it("消費カロリーが空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "running",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorCaloriesRequired,
      });
    });

    it("日付が空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "running",
        date: "",
        caloriesBurned: "300",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorDateRequired,
      });
    });

    it("消費カロリーが負なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "running",
        caloriesBurned: "-10",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorCaloriesRequired,
      });
    });

    it("種目名が空なら無効", () => {
      const result = validateWorkoutRecordForm({
        ...baseValues,
        label: "running",
        exerciseName: "",
        caloriesBurned: "300",
      });

      expect(result).toEqual({
        valid: false,
        error: texts.form.errorExerciseNameRequired,
      });
    });
  });
});

describe("validateStrengthWorkoutForm", () => {
  it("種目名を引数で受け取り、重量・回数が揃っていれば有効", () => {
    const result = validateStrengthWorkoutForm(
      { ...baseValues, label: "strength", weightKg: "60", reps: "10" },
      "ベンチプレス",
    );

    expect(result).toEqual({
      valid: true,
      record: {
        label: "strength",
        date: "2026-03-01",
        exerciseName: "ベンチプレス",
        weightKg: 60,
        reps: 10,
      },
    });
  });

  it("重量が空なら無効", () => {
    const result = validateStrengthWorkoutForm(
      { ...baseValues, label: "strength", reps: "10" },
      "ベンチプレス",
    );

    expect(result).toEqual({
      valid: false,
      error: texts.form.errorWeightRequired,
    });
  });
});

describe("validateRunningWorkoutForm", () => {
  it("種目名を引数で受け取り、消費カロリーが揃っていれば有効", () => {
    const result = validateRunningWorkoutForm(
      { ...baseValues, label: "running", caloriesBurned: "300" },
      "朝のジョグ",
    );

    expect(result).toEqual({
      valid: true,
      record: {
        label: "running",
        date: "2026-03-01",
        exerciseName: "朝のジョグ",
        caloriesBurned: 300,
      },
    });
  });

  it("消費カロリーが空なら無効", () => {
    const result = validateRunningWorkoutForm(
      { ...baseValues, label: "running" },
      "朝のジョグ",
    );

    expect(result).toEqual({
      valid: false,
      error: texts.form.errorCaloriesRequired,
    });
  });
});
