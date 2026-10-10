import type { WorkoutExercise } from "@/types/routine";
import {
  createWorkoutExercise,
  renameWorkoutExerciseInList,
  removeWorkoutExerciseFromList,
} from "../workoutExerciseMutations";

const exercise: WorkoutExercise = {
  id: "one",
  name: "ベンチ",
  label: "strength",
  createdAt: "old",
  updatedAt: "old",
};
it("生成時に名前を正規化し指定されたIDと時刻を使う", () => {
  expect(
    createWorkoutExercise(
      { name: " ラン ", label: "running" },
      [exercise],
      "two",
      "now",
    ),
  ).toEqual({
    id: "two",
    name: "ラン",
    label: "running",
    createdAt: "now",
    updatedAt: "now",
  });
});
it("改名は元配列と種目を変えず作成日時を保存する", () => {
  const list = Object.freeze([Object.freeze({ ...exercise })]);
  const updated = renameWorkoutExerciseInList(list, "one", " プレス ", "now");
  expect(updated).toEqual({ ...exercise, name: "プレス", updatedAt: "now" });
  expect(list[0]).toEqual(exercise);
});
it("削除は元配列を変えず、見つからないIDは拒否する", () => {
  const list = Object.freeze([exercise]);
  expect(removeWorkoutExerciseFromList(list, "one")).toEqual([]);
  expect(list).toEqual([exercise]);
  expect(() => removeWorkoutExerciseFromList(list, "missing")).toThrow();
});
it("改名は同種別の重複を拒否し別種別の同名を許可する", () => {
  const other = { ...exercise, id: "two", name: "別種目" };
  expect(() =>
    renameWorkoutExerciseInList([exercise, other], "two", " ベンチ ", "now"),
  ).toThrow();
  expect(
    renameWorkoutExerciseInList(
      [exercise, { ...other, label: "running" }],
      "two",
      "ベンチ",
      "now",
    ).name,
  ).toBe("ベンチ");
});
