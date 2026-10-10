import { useState } from "react";
import type { WorkoutExercise } from "@/types/routine";
import type { WorkoutExerciseActions } from "../workoutExerciseActionTypes";
import texts from "../../locales/ja.json";
import { inputClassName } from "./workoutFormFieldStyles";

export const WorkoutExerciseEditor = ({
  exercise,
  actions,
}: {
  exercise: WorkoutExercise;
  actions: Pick<WorkoutExerciseActions, "rename" | "remove">;
}) => {
  const [name, setName] = useState(exercise.name);
  return (
    <li className="space-y-2 border-b border-gray-200 py-3">
      <input
        aria-label={texts.exercises.renameLabel.replace(
          "{name}",
          exercise.name,
        )}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClassName}
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="text-blue-600"
          onClick={() => actions.rename(exercise.id, name)}
        >
          {texts.exercises.save}
        </button>
        <button
          type="button"
          className="text-red-600"
          onClick={() => actions.remove(exercise)}
        >
          {texts.exercises.delete}
        </button>
      </div>
    </li>
  );
};
