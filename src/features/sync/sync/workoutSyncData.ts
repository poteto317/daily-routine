import {
  getWorkoutExercises,
  getWorkoutRecordHistory,
  saveWorkoutExercises,
  saveWorkoutRecordHistory,
} from "@/features/workout-tracker/storage";
import type { SyncPayload } from "./types";

export type WorkoutSyncData = Pick<
  SyncPayload,
  "workoutExercises" | "workoutRecordHistory"
>;

export const collectWorkoutSyncData = (): WorkoutSyncData => ({
  workoutRecordHistory: getWorkoutRecordHistory(),
  workoutExercises: getWorkoutExercises(),
});

/** 古い端末の欠損・nullはローカルを保持し、明示された空は尊重する。 */
export const normalizeWorkoutSyncData = (
  data: Partial<WorkoutSyncData>,
): WorkoutSyncData => ({
  workoutRecordHistory: data.workoutRecordHistory ?? getWorkoutRecordHistory(),
  workoutExercises: data.workoutExercises ?? getWorkoutExercises(),
});

export const saveWorkoutSyncData = (data: WorkoutSyncData): void => {
  saveWorkoutRecordHistory(data.workoutRecordHistory);
  saveWorkoutExercises(data.workoutExercises);
};

export const hasWorkoutSyncData = (data: WorkoutSyncData): boolean =>
  data.workoutExercises.length > 0 ||
  Object.keys(data.workoutRecordHistory).length > 0;
