import { useId } from "react";
import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";
import texts from "../../locales/ja.json";
import { inputClassName } from "./workoutFormFieldStyles";

export const WorkoutExerciseSelect = ({
  exercises,
  label,
  value,
  onChangeAction,
}: {
  exercises: WorkoutExercise[];
  label: WorkoutLabel;
  value: string;
  onChangeAction: (id: string) => void;
}) => {
  const id = useId();
  const options = exercises.filter((ex) => ex.label === label);
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-500 mb-1">
        {texts.form.exerciseNameLabel}
      </label>
      <select
        id={id}
        value={options.some((ex) => ex.id === value) ? value : ""}
        onChange={(e) => onChangeAction(e.target.value)}
        className={inputClassName}
      >
        <option value="">{texts.exercises.select}</option>
        {options.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      {options.length === 0 && (
        <p className="text-sm text-gray-500 mt-1">{texts.exercises.empty}</p>
      )}
    </div>
  );
};
