import { renderHook } from "@testing-library/react";
import type { WorkoutRecord } from "@/types/routine";
import texts from "../locales/ja.json";
import { useWorkoutTrackerActions } from "../page/useWorkoutTrackerActions";
import { addWorkoutRecord, deleteWorkoutRecord } from "../storage";
import { validateWorkoutRecordForm } from "../workoutRecordFormValidation";

jest.mock("../storage", () => ({
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
  weightKg: 60,
  reps: 10,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
};

describe("useWorkoutTrackerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleAddRecord", () => {
    it("バリデーション成功時はaddWorkoutRecord・resetForm・reloadを呼び、直前のエラーをクリアする", () => {
      mockValidate.mockReturnValue({
        valid: true,
        record: {
          label: "strength",
          date: "2026-03-01",
          exerciseName: "ベンチプレス",
          weightKg: 60,
          reps: 10,
        },
      });
      const reload = jest.fn();
      const resetForm = jest.fn();
      const setError = jest.fn();

      const { result } = renderHook(() =>
        useWorkoutTrackerActions({ reload, resetForm, setError }),
      );
      result.current.handleAddRecord(formValues);

      expect(mockAddWorkoutRecord).toHaveBeenCalledWith({
        label: "strength",
        date: "2026-03-01",
        exerciseName: "ベンチプレス",
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

      const { result } = renderHook(() =>
        useWorkoutTrackerActions({ reload, resetForm, setError }),
      );
      result.current.handleAddRecord(formValues);

      expect(mockAddWorkoutRecord).not.toHaveBeenCalled();
      expect(resetForm).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
      expect(setError).toHaveBeenCalledWith("エラー");
    });
  });

  describe("handleDeleteRecord", () => {
    it("確認OKならdeleteWorkoutRecordとreloadを呼ぶ", () => {
      jest.spyOn(window, "confirm").mockReturnValue(true);
      const reload = jest.fn();

      const { result } = renderHook(() =>
        useWorkoutTrackerActions({
          reload,
          resetForm: jest.fn(),
          setError: jest.fn(),
        }),
      );
      result.current.handleDeleteRecord(record);

      expect(window.confirm).toHaveBeenCalledWith(
        texts.page.confirmDeleteTemplate.replace("{name}", "ベンチプレス"),
      );
      expect(mockDeleteWorkoutRecord).toHaveBeenCalledWith("2026-03-01", "1");
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it("確認キャンセルなら何もしない", () => {
      jest.spyOn(window, "confirm").mockReturnValue(false);
      const reload = jest.fn();

      const { result } = renderHook(() =>
        useWorkoutTrackerActions({
          reload,
          resetForm: jest.fn(),
          setError: jest.fn(),
        }),
      );
      result.current.handleDeleteRecord(record);

      expect(mockDeleteWorkoutRecord).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
