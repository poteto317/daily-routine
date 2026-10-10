import type { WorkoutRecord } from "@/types/routine";
import {
  createAddWorkoutRecordHandler,
  createDeleteWorkoutRecordHandler,
} from "../page/workoutTrackerMutationActions";
import { addWorkoutRecord, deleteWorkoutRecord } from "../storage";
import { validateWorkoutRecordForm } from "../workoutRecordFormValidation";
import texts from "../locales/ja.json";

jest.mock("../storage", () => ({
  getWorkoutExercises: jest.fn(() => [
    {
      id: "ベンチプレス",
      name: "ベンチプレス",
      label: "strength" as const,
      createdAt: "",
      updatedAt: "",
    },
  ]),
  addWorkoutRecord: jest.fn(),
  deleteWorkoutRecord: jest.fn(),
}));

jest.mock("../workoutRecordFormValidation", () => ({
  validateWorkoutRecordForm: jest.fn(),
}));

const mockAddWorkoutRecord = addWorkoutRecord as jest.MockedFunction<
  typeof addWorkoutRecord
>;
const mockDeleteWorkoutRecord = deleteWorkoutRecord as jest.MockedFunction<
  typeof deleteWorkoutRecord
>;
const mockValidate = validateWorkoutRecordForm as jest.MockedFunction<
  typeof validateWorkoutRecordForm
>;

const formValues = {
  label: "strength" as const,
  date: "2026-03-01",
  exerciseName: "ベンチプレス",
  exerciseId: "ベンチプレス",
  weightKg: "60",
  reps: "10",
  sets: "",
  caloriesBurned: "",
};

const record: WorkoutRecord = {
  id: "1",
  date: "2026-03-01",
  label: "strength",
  exerciseName: "ベンチプレス",
  exerciseId: "ベンチプレス",
  weightKg: 60,
  reps: 10,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
};

describe("createAddWorkoutRecordHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("バリデーション成功時はaddWorkoutRecord・resetForm・reloadを呼び、直前のエラーをクリアする", () => {
    mockValidate.mockReturnValue({
      valid: true,
      record: {
        label: "strength",
        date: "2026-03-01",
        exerciseName: "ベンチプレス",
        exerciseId: "ベンチプレス",
        weightKg: 60,
        reps: 10,
      },
    });
    const reload = jest.fn();
    const resetForm = jest.fn();
    const setError = jest.fn();

    createAddWorkoutRecordHandler({ resetForm, reload, setError })(formValues);

    expect(mockAddWorkoutRecord).toHaveBeenCalledWith({
      label: "strength",
      date: "2026-03-01",
      exerciseName: "ベンチプレス",
      exerciseId: "ベンチプレス",
      weightKg: 60,
      reps: 10,
    });
    expect(resetForm).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith(null);
  });

  it("バリデーション失敗時はsetErrorのみ呼び、永続化しない", () => {
    mockValidate.mockReturnValue({ valid: false, error: "エラー" });
    const reload = jest.fn();
    const resetForm = jest.fn();
    const setError = jest.fn();

    createAddWorkoutRecordHandler({ resetForm, reload, setError })(formValues);

    expect(mockAddWorkoutRecord).not.toHaveBeenCalled();
    expect(resetForm).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith("エラー");
  });
});

describe("createDeleteWorkoutRecordHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("確認OKならdeleteWorkoutRecordとreloadを呼ぶ", () => {
    const reload = jest.fn();
    const confirmDelete = jest.fn().mockReturnValue(true);

    createDeleteWorkoutRecordHandler({ reload, confirmDelete })(record);

    expect(confirmDelete).toHaveBeenCalledWith(
      texts.page.confirmDeleteTemplate.replace("{name}", "ベンチプレス"),
    );
    expect(mockDeleteWorkoutRecord).toHaveBeenCalledWith("2026-03-01", "1");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("確認キャンセルなら何もしない", () => {
    const reload = jest.fn();
    const confirmDelete = jest.fn().mockReturnValue(false);

    createDeleteWorkoutRecordHandler({ reload, confirmDelete })(record);

    expect(mockDeleteWorkoutRecord).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});
