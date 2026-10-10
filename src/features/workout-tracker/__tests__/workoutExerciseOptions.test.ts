import {
  getWorkoutExerciseOptions,
  getSelectedWorkoutExerciseId,
} from "../page/workoutExerciseOptions";
import type { WorkoutExercise } from "@/types/routine";
const exercises: WorkoutExercise[] = [
  { id: "s", name: "筋トレ", label: "strength", createdAt: "", updatedAt: "" },
  { id: "r", name: "ラン", label: "running", createdAt: "", updatedAt: "" },
];
it("種別で候補を絞り元の配列と順序を維持する", () => {
  expect(getWorkoutExerciseOptions(exercises, "running")).toEqual([
    exercises[1],
  ]);
  expect(exercises.map(({ id }) => id)).toEqual(["s", "r"]);
});
it("削除済み・別種別の選択を空にし有効なIDだけ保持する", () => {
  const options = getWorkoutExerciseOptions(exercises, "strength");
  expect(getSelectedWorkoutExerciseId(options, "s")).toBe("s");
  for (const id of ["r", "deleted", ""])
    expect(getSelectedWorkoutExerciseId(options, id)).toBe("");
});
