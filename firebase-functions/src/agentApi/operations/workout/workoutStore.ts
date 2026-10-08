import type { SyncDocData } from "../../syncDoc";
import { readArray, readObject } from "../dataAccess";
import { notFound } from "../../errors";
import { invalidField } from "../../validation/fieldError";
import type { WorkoutExercise, WorkoutHistory } from "./workoutTypes";

export const readExercises = (data: SyncDocData): WorkoutExercise[] =>
  readArray<WorkoutExercise>(data, "workoutExercises");
export const readWorkoutHistory = (data: SyncDocData): WorkoutHistory =>
  readObject(data, "workoutRecordHistory") as WorkoutHistory;

/** 新規・付け替え時だけ参照先を検証し、削除後の履歴更新は妨げない。 */
export const resolveExercise = (
  data: SyncDocData,
  id: string,
): WorkoutExercise => {
  const exercise = readExercises(data).find((ex) => ex.id === id);
  if (!exercise) throw invalidField("exerciseId", "存在しない種目です");
  return exercise;
};
export const findWorkoutRecord = (
  history: WorkoutHistory,
  id: string | undefined,
) => {
  for (const [key, records] of Object.entries(history)) {
    const record = records.find((record) => record.id === id);
    if (record) return { key, record };
  }
  throw notFound("運動記録");
};
export const removeFromHistory = (
  history: WorkoutHistory,
  key: string,
  id: string,
): WorkoutHistory => {
  const next = { ...history };
  const remaining = history[key].filter((record) => record.id !== id);
  if (remaining.length) next[key] = remaining;
  else delete next[key];
  return next;
};
