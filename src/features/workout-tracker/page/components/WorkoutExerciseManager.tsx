import type { WorkoutExercise, WorkoutLabel } from "@/types/routine";
import type { WorkoutExerciseActions } from "../workoutExerciseActionTypes";
import { getWorkoutExerciseOptions } from "../workoutExerciseOptions";
import { WorkoutExerciseAddForm } from "./WorkoutExerciseAddForm";
import { WorkoutExerciseEditor } from "./WorkoutExerciseEditor";
import texts from "../../locales/ja.json";

export const WorkoutExerciseManager = ({
  label,
  exercises,
  actions,
}: {
  label: WorkoutLabel;
  exercises: WorkoutExercise[];
  actions: WorkoutExerciseActions;
}) => {
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
        <WorkoutExerciseAddForm add={actions.add} />
        {actions.error && (
          <p role="alert" className="text-sm text-red-600">
            {actions.error}
          </p>
        )}
        <ul>
          {getWorkoutExerciseOptions(exercises, label).map((ex) => (
            <WorkoutExerciseEditor
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
