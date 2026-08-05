"use client";

import texts from "../../locales/ja.json";
import { inputClassName } from "./workoutFormFieldStyles";

type WorkoutRunningFieldsProps = {
  caloriesBurned: string;
  onChangeCaloriesBurnedAction: (caloriesBurned: string) => void;
};

/**
 * ランニング記録の入力項目（消費カロリー）。
 */
export const WorkoutRunningFields = ({
  caloriesBurned,
  onChangeCaloriesBurnedAction,
}: WorkoutRunningFieldsProps) => (
  <div>
    <label className="block text-xs text-gray-500 dark:text-gray-600 mb-1">
      {texts.form.caloriesLabel}
    </label>
    <input
      type="number"
      inputMode="numeric"
      value={caloriesBurned}
      onChange={(e) => onChangeCaloriesBurnedAction(e.target.value)}
      placeholder={texts.form.caloriesPlaceholder}
      className={inputClassName}
    />
  </div>
);
