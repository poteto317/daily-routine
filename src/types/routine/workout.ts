/** 運動記録のラベル（種別） */
export type WorkoutLabel = "strength" | "running";

interface WorkoutRecordBase {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** 種目名 */
  exerciseName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrengthWorkoutRecord extends WorkoutRecordBase {
  label: "strength";
  /** 重量(kg) */
  weightKg: number;
  /** 回数 */
  reps: number;
  /** セット数 */
  sets?: number;
}

export interface RunningWorkoutRecord extends WorkoutRecordBase {
  label: "running";
  /** 消費カロリー(kcal) */
  caloriesBurned: number;
}

export type WorkoutRecord = StrengthWorkoutRecord | RunningWorkoutRecord;

export interface WorkoutRecordHistory {
  [date: string]: WorkoutRecord[];
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/**
 * 新規作成時の入力型（id/createdAt/updatedAtを除く）。
 * `Omit`はそのままでは共用体に分配されず`label`ごとの個別フィールド
 * （`weightKg`/`caloriesBurned`等）が失われるため、`DistributiveOmit`で
 * `label`ごとに分配してから`Omit`を適用する。
 */
export type NewWorkoutRecordInput = DistributiveOmit<
  WorkoutRecord,
  "id" | "createdAt" | "updatedAt"
>;
