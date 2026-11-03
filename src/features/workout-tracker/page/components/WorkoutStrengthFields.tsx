"use client";

import { useId } from "react";
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

const SETS_OPTIONS = ["1", "2", "3", "4", "5"] as const;

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
}: WorkoutStrengthFieldsProps) => {
  const weightInputId = useId();
  const repsInputId = useId();
  const setsSelectId = useId();

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label
          htmlFor={weightInputId}
          className="block text-xs text-gray-500 dark:text-gray-600 mb-1"
        >
          {texts.form.weightLabel}
        </label>
        <input
          id={weightInputId}
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weightKg}
          onChange={(e) => onChangeWeightKgAction(e.target.value)}
          placeholder={texts.form.weightPlaceholder}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor={repsInputId}
          className="block text-xs text-gray-500 dark:text-gray-600 mb-1"
        >
          {texts.form.repsLabel}
        </label>
        <input
          id={repsInputId}
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => onChangeRepsAction(e.target.value)}
          placeholder={texts.form.repsPlaceholder}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor={setsSelectId}
          className="block text-xs text-gray-500 dark:text-gray-600 mb-1"
        >
          {texts.form.setsLabel}
        </label>
        <select
          id={setsSelectId}
          value={sets}
          onChange={(e) => onChangeSetsAction(e.target.value)}
          className={inputClassName}
        >
          {SETS_OPTIONS.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
