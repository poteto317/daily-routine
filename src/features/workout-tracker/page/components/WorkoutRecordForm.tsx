"use client";

import type { WorkoutLabel, WorkoutExercise } from "@/types/routine";
import texts from "../../locales/ja.json";
import type { WorkoutRecordFormValues } from "../../workoutRecordFormValidation";
import { WorkoutLabelSelector } from "./WorkoutLabelSelector";
import { WorkoutRunningFields } from "./WorkoutRunningFields";
import { WorkoutStrengthFields } from "./WorkoutStrengthFields";
import { inputClassName } from "./workoutFormFieldStyles";

import { WorkoutExerciseSelect } from "./WorkoutExerciseSelect";

type WorkoutRecordFormProps = {
  exercises: WorkoutExercise[];
  values: WorkoutRecordFormValues;
  error: string | null;
  onChangeLabelAction: (label: WorkoutLabel) => void;
  onChangeDateAction: (date: string) => void;
  onChangeExerciseIdAction: (exerciseId: string) => void;
  onChangeWeightKgAction: (weightKg: string) => void;
  onChangeRepsAction: (reps: string) => void;
  onChangeSetsAction: (sets: string) => void;
  onChangeCaloriesBurnedAction: (caloriesBurned: string) => void;
  onSubmitAction: () => void;
};

/**
 * 運動記録の入力フォーム。
 * ラベル（筋トレ/ランニング）に応じて入力項目を出し分ける。
 */
export const WorkoutRecordForm = ({
  values,
  exercises,
  error,
  onChangeLabelAction,
  onChangeDateAction,
  onChangeExerciseIdAction,
  onChangeWeightKgAction,
  onChangeRepsAction,
  onChangeSetsAction,
  onChangeCaloriesBurnedAction,
  onSubmitAction,
}: WorkoutRecordFormProps) => {
  const isStrength = values.label === "strength";

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-200 rounded-xl space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-700">
        {texts.form.title}
      </h2>

      <WorkoutLabelSelector
        label={values.label}
        onChangeLabelAction={onChangeLabelAction}
      />

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-600 mb-1">
          {texts.form.dateLabel}
        </label>
        <input
          type="date"
          value={values.date}
          onChange={(e) => onChangeDateAction(e.target.value)}
          className={inputClassName}
        />
      </div>

      <WorkoutExerciseSelect
        exercises={exercises}
        label={values.label}
        value={values.exerciseId}
        onChangeAction={onChangeExerciseIdAction}
      />

      {isStrength ? (
        <WorkoutStrengthFields
          weightKg={values.weightKg}
          reps={values.reps}
          sets={values.sets}
          onChangeWeightKgAction={onChangeWeightKgAction}
          onChangeRepsAction={onChangeRepsAction}
          onChangeSetsAction={onChangeSetsAction}
        />
      ) : (
        <WorkoutRunningFields
          caloriesBurned={values.caloriesBurned}
          onChangeCaloriesBurnedAction={onChangeCaloriesBurnedAction}
        />
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmitAction}
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {texts.form.addButton}
      </button>
    </div>
  );
};
