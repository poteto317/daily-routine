"use client";

import type { WorkoutLabel } from "@/types/routine";
import texts from "../../locales/ja.json";
import type { WorkoutRecordFormValues } from "../../workoutRecordFormValidation";
import { WorkoutLabelSelector } from "./WorkoutLabelSelector";
import { WorkoutRunningFields } from "./WorkoutRunningFields";
import { WorkoutStrengthFields } from "./WorkoutStrengthFields";
import { inputClassName } from "./workoutFormFieldStyles";

type WorkoutRecordFormProps = {
  values: WorkoutRecordFormValues;
  error: string | null;
  onChangeLabelAction: (label: WorkoutLabel) => void;
  onChangeDateAction: (date: string) => void;
  onChangeExerciseNameAction: (exerciseName: string) => void;
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
  error,
  onChangeLabelAction,
  onChangeDateAction,
  onChangeExerciseNameAction,
  onChangeWeightKgAction,
  onChangeRepsAction,
  onChangeSetsAction,
  onChangeCaloriesBurnedAction,
  onSubmitAction,
}: WorkoutRecordFormProps) => {
  const isStrength = values.label === "strength";

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-600 mb-1">
          {texts.form.exerciseNameLabel}
        </label>
        <input
          type="text"
          value={values.exerciseName}
          onChange={(e) => onChangeExerciseNameAction(e.target.value)}
          placeholder={texts.form.exerciseNamePlaceholder}
          className={inputClassName}
        />
      </div>

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
        <p className="text-sm text-red-500" role="alert">
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
