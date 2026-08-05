"use client";

import texts from "../../locales/ja.json";
import { inputClassName } from "./workoutFormFieldStyles";

type WorkoutStrengthFieldsProps = {
  weightKg: string;
  reps: string;
  sets: string;
  onChangeWeightKgAction: (weightKg: string) => void;
  onChangeRepsAction: (reps: string) => void;
  onChangeSetsAction: (sets: string) => void;
};

/**
 * 筋トレ記録の入力項目（重量・回数・セット数）。
 */
export const WorkoutStrengthFields = ({
  weightKg,
  reps,
  sets,
  onChangeWeightKgAction,
  onChangeRepsAction,
  onChangeSetsAction,
}: WorkoutStrengthFieldsProps) => (
  <div className="grid grid-cols-3 gap-2">
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-600 mb-1">
        {texts.form.weightLabel}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={weightKg}
        onChange={(e) => onChangeWeightKgAction(e.target.value)}
        placeholder={texts.form.weightPlaceholder}
        className={inputClassName}
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-600 mb-1">
        {texts.form.repsLabel}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => onChangeRepsAction(e.target.value)}
        placeholder={texts.form.repsPlaceholder}
        className={inputClassName}
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-600 mb-1">
        {texts.form.setsLabel}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={sets}
        onChange={(e) => onChangeSetsAction(e.target.value)}
        placeholder={texts.form.setsPlaceholder}
        className={inputClassName}
      />
    </div>
  </div>
);
