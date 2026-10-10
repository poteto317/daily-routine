import type { SyncDocData } from "../../syncDoc";
import { readArray } from "../dataAccess";
import { invalidField } from "../../validation/fieldError";
import { notFound } from "../../errors";
import type { WorkoutExercise } from "./workoutTypes";

export const readExercises = (data: SyncDocData): WorkoutExercise[] =>
  readArray<WorkoutExercise>(data, "workoutExercises");
/** 新規・付け替え時だけ参照先を検証し、削除後の履歴更新は妨げない。 */
export const resolveExercise = (
  data: SyncDocData,
  id: string,
): WorkoutExercise => {
  const exercise = readExercises(data).find((ex) => ex.id === id);
  if (!exercise) throw invalidField("exerciseId", "存在しない種目です");
  return exercise;
};
export const findExercise = (
  exercises: WorkoutExercise[],
  id: string | undefined,
): WorkoutExercise => {
  const exercise = exercises.find((ex) => ex.id === id);
  if (!exercise) throw notFound("種目");
  return exercise;
};
