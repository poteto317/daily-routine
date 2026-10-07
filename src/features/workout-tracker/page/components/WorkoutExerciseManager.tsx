import { useId, useState } from "react";
import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";
import type { useWorkoutExerciseActions } from "../useWorkoutExerciseActions";
import texts from "../../locales/ja.json";
import { inputClassName } from "./workoutFormFieldStyles";

type Actions = ReturnType<typeof useWorkoutExerciseActions>;

const ExerciseEditor = ({
  exercise,
  actions,
}: {
  exercise: WorkoutExercise;
  actions: Actions;
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

export const WorkoutExerciseManager = ({
  label,
  exercises,
  actions,
}: {
  label: WorkoutLabel;
  exercises: WorkoutExercise[];
  actions: Actions;
}) => {
  const [name, setName] = useState("");
  const id = useId();
  return (
    <details className="mb-6 rounded-xl border border-gray-200 p-4">
      <summary className="cursor-pointer font-medium">
        {texts.exercises.manage}
      </summary>
      <div className="mt-3 space-y-3">
        <h2 className="font-semibold">
          {texts.exercises.title} —{" "}
          {label === "strength"
            ? texts.form.labelStrength
            : texts.form.labelRunning}
        </h2>
        <label htmlFor={id} className="block text-sm">
          {texts.exercises.newNameLabel}
        </label>
        <input
          id={id}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClassName}
        />
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={() => {
            if (actions.add(name)) setName("");
          }}
        >
          {texts.exercises.add}
        </button>
        {actions.error && (
          <p role="alert" className="text-sm text-red-600">
            {actions.error}
          </p>
        )}
        <ul>
          {exercises
            .filter((ex) => ex.label === label)
            .map((ex) => (
              <ExerciseEditor
                key={ex.id + ex.updatedAt}
                exercise={ex}
                actions={actions}
              />
            ))}
        </ul>
      </div>
    </details>
  );
};
