import type { WorkoutExercise, WorkoutRecord } from "./workoutTypes";

/** 保存済みの旧記録と異なり、新規作成には種目IDが必要。 */
type CreateInput<T> = T extends WorkoutRecord
  ? Omit<T, "id" | "createdAt" | "updatedAt" | "exerciseId"> & {
      exerciseId: string;
    }
  : never;
export type WorkoutRecordCreateInput = CreateInput<WorkoutRecord>;

/** 入力経路に依存しない、検証済みの記録変更内容。 */
export type WorkoutRecordPatch = {
  date?: string;
  exercise?: WorkoutExercise;
  weightKg?: number;
  reps?: number;
  sets?: number | null;
  caloriesBurned?: number;
};
