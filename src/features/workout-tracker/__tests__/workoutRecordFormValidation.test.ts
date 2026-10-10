import texts from "../locales/ja.json";
import {
  validateWorkoutRecordForm,
  validateStrengthWorkoutForm,
  validateRunningWorkoutForm,
  type WorkoutRecordFormValues,
} from "../workoutRecordFormValidation";
import type { WorkoutExercise } from "@/types/routine";
const exercises: WorkoutExercise[] = [
  { id: "s", name: "ベンチ", label: "strength", createdAt: "", updatedAt: "" },
  { id: "r", name: "ジョグ", label: "running", createdAt: "", updatedAt: "" },
];
const values: WorkoutRecordFormValues = {
  date: "2026-10-08",
  label: "strength",
  exerciseId: "s",
  weightKg: "60",
  reps: "10",
  sets: "",
  caloriesBurned: "300",
};
it("選択した種目のIDと名前を保存し、空欄のsetsは省略する", () => {
  expect(validateWorkoutRecordForm(values, exercises)).toEqual({
    valid: true,
    record: {
      date: "2026-10-08",
      label: "strength",
      exerciseId: "s",
      exerciseName: "ベンチ",
      weightKg: 60,
      reps: 10,
    },
  });
});
it("ランニングの記録に筋トレ項目を混ぜない", () => {
  expect(
    validateWorkoutRecordForm(
      { ...values, label: "running", exerciseId: "r" },
      exercises,
    ),
  ).toEqual({
    valid: true,
    record: {
      date: "2026-10-08",
      label: "running",
      exerciseId: "r",
      exerciseName: "ジョグ",
      caloriesBurned: 300,
    },
  });
});
it.each(["", "gone", "r"])(
  "未選択・削除済み・別種別を拒否: %s",
  (exerciseId) => {
    expect(
      validateWorkoutRecordForm({ ...values, exerciseId }, exercises).valid,
    ).toBe(false);
  },
);
it.each(["", "2026-02-30", "2026-13-01", "invalid"])(
  "不正な日付を拒否: %s",
  (date) => {
    expect(
      validateWorkoutRecordForm({ ...values, date }, exercises).valid,
    ).toBe(false);
  },
);
it.each(["", "0", "-1", "Infinity", "1e400", "abc"])(
  "必須の正数項目の不正入力を拒否: %s",
  (value) => {
    for (const key of ["weightKg", "reps"] as const)
      expect(
        validateWorkoutRecordForm({ ...values, [key]: value }, exercises).valid,
      ).toBe(false);
    expect(
      validateWorkoutRecordForm(
        { ...values, label: "running", exerciseId: "r", caloriesBurned: value },
        exercises,
      ).valid,
    ).toBe(false);
  },
);
it.each(["0", "-1", "Infinity", "abc"])(
  "入力済みsetsの不正値を拒否: %s",
  (sets) => {
    expect(
      validateWorkoutRecordForm({ ...values, sets }, exercises).valid,
    ).toBe(false);
  },
);
it("既存仕様どおり小数を受け付ける", () => {
  expect(
    validateWorkoutRecordForm(
      { ...values, weightKg: "0.5", reps: "1.5", sets: "2.5" },
      exercises,
    ),
  ).toMatchObject({
    valid: true,
    record: { weightKg: 0.5, reps: 1.5, sets: 2.5 },
  });
});

it("種目、日付、重量、回数の順にエラーを返す", () => {
  const invalid = {
    ...values,
    exerciseId: "missing",
    date: "bad",
    weightKg: "0",
    reps: "0",
    sets: "0",
  };
  expect(validateWorkoutRecordForm(invalid, exercises)).toEqual({
    valid: false,
    error: texts.form.errorExerciseNameRequired,
  });
  expect(
    validateWorkoutRecordForm({ ...invalid, exerciseId: "s" }, exercises),
  ).toEqual({ valid: false, error: texts.form.errorDateRequired });
  expect(
    validateWorkoutRecordForm(
      { ...invalid, exerciseId: "s", date: values.date },
      exercises,
    ),
  ).toEqual({ valid: false, error: texts.form.errorWeightRequired });
  expect(
    validateWorkoutRecordForm(
      { ...invalid, exerciseId: "s", date: values.date, weightKg: "1" },
      exercises,
    ),
  ).toEqual({ valid: false, error: texts.form.errorRepsRequired });
});

it("従来の種別別バリデータも公開入口から利用できる", () => {
  expect(validateStrengthWorkoutForm(values, "保存時の種目名")).toEqual({
    valid: true,
    record: {
      label: "strength",
      date: values.date,
      exerciseId: "s",
      exerciseName: "保存時の種目名",
      weightKg: 60,
      reps: 10,
    },
  });
  expect(
    validateRunningWorkoutForm(
      { ...values, label: "running", exerciseId: "r" },
      "ジョグ",
    ),
  ).toEqual({
    valid: true,
    record: {
      label: "running",
      date: values.date,
      exerciseId: "r",
      exerciseName: "ジョグ",
      caloriesBurned: 300,
    },
  });
});
