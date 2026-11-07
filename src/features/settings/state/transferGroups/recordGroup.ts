import {
  getJournalHistory,
  getWeeklyLogHistory,
  saveJournalHistory,
  saveWeeklyLogHistory,
} from "@/features/journal/storage";
import { getMealHistory, saveMealHistory } from "@/features/meal/storage";
import {
  getPomodoroHistory,
  savePomodoroHistory,
} from "@/features/pomodoro/storage";
import {
  getWeightHistory,
  saveWeightHistory,
} from "@/features/weight-tracker/storage";
import {
  getWorkSessionHistory,
  getWorkTemplates,
  saveWorkSessionHistory,
  saveWorkTemplates,
} from "@/features/work-tracker/storage";
import {
  getWorkoutExercises,
  saveWorkoutExercises,
  getWorkoutRecordHistory,
  saveWorkoutRecordHistory,
} from "@/features/workout-tracker/storage";
import { DATA_TRANSFER_ERROR_MESSAGES } from "../errorMessages";
import {
  arrayField,
  objectField,
  type TransferField,
  type TransferPayload,
} from "../transferPayloadRestore";

const invalid = DATA_TRANSFER_ERROR_MESSAGES.invalidFieldFormat;

/**
 * 日々の記録をまとめたグループ。
 *
 * ジャーナル・業務日誌・体重・運動・食事・ポモドーロ・作業記録は、どれも
 * 「日々つけた記録」として同じ扱いでよく、個別に選ぶ意味が薄いため 1 つにする。
 */
export const collectRecordTransferData = (): TransferPayload => ({
  journalHistory: getJournalHistory(),
  weeklyLogHistory: getWeeklyLogHistory(),
  weightHistory: getWeightHistory(),
  workoutRecordHistory: getWorkoutRecordHistory(),
  workoutExercises: getWorkoutExercises(),
  mealHistory: getMealHistory(),
  pomodoroHistory: getPomodoroHistory(),
  workSessionHistory: getWorkSessionHistory(),
  workTemplates: getWorkTemplates(),
});

/** 履歴はいずれも日付などをキーにしたオブジェクト。テンプレートだけが配列 */
export const RECORD_TRANSFER_FIELDS: TransferField[] = [
  arrayField(
    "workoutExercises",
    saveWorkoutExercises,
    invalid("workoutExercises"),
  ),
  objectField("journalHistory", saveJournalHistory, invalid("journalHistory")),
  objectField(
    "weeklyLogHistory",
    saveWeeklyLogHistory,
    invalid("weeklyLogHistory"),
  ),
  objectField("weightHistory", saveWeightHistory, invalid("weightHistory")),
  objectField(
    "workoutRecordHistory",
    saveWorkoutRecordHistory,
    invalid("workoutRecordHistory"),
  ),
  objectField("mealHistory", saveMealHistory, invalid("mealHistory")),
  objectField(
    "pomodoroHistory",
    savePomodoroHistory,
    invalid("pomodoroHistory"),
  ),
  objectField(
    "workSessionHistory",
    saveWorkSessionHistory,
    invalid("workSessionHistory"),
  ),
  arrayField("workTemplates", saveWorkTemplates, invalid("workTemplates")),
];
