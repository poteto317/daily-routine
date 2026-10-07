import type { WorkoutRecordHistory } from "@/types/routine";
import {
  addWorkoutRecord,
  deleteWorkoutRecord,
  getAllWorkoutRecords,
} from "../storageRecords";
import {
  getWorkoutRecordHistory,
  saveWorkoutRecordHistory,
} from "../storageData";
import * as coreStorage from "@/lib/storage/core";

jest.mock("../storageData");
jest.mock("@/lib/storage/core", () => ({
  generateId: jest.fn(),
}));

const mockGetWorkoutRecordHistory =
  getWorkoutRecordHistory as jest.MockedFunction<
    typeof getWorkoutRecordHistory
  >;
const mockSaveWorkoutRecordHistory =
  saveWorkoutRecordHistory as jest.MockedFunction<
    typeof saveWorkoutRecordHistory
  >;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("workout-tracker storageRecords", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkoutRecordHistory.mockReturnValue({});
    mockSaveWorkoutRecordHistory.mockReturnValue(true);
    mockGenerateId.mockReturnValue("workout-1");
  });

  describe("addWorkoutRecord", () => {
    it("新しい日付にレコードを追加する", () => {
      const record = addWorkoutRecord({
        exerciseId: "exercise-1",
        label: "strength",
        date: "2026-03-01",
        exerciseName: "ベンチプレス",
        weightKg: 60,
        reps: 10,
        sets: 3,
      });

      expect(record).toMatchObject({
        id: "workout-1",
        label: "strength",
        date: "2026-03-01",
        exerciseName: "ベンチプレス",
        weightKg: 60,
        reps: 10,
        sets: 3,
      });
      expect(mockSaveWorkoutRecordHistory).toHaveBeenCalledWith({
        "2026-03-01": [record],
      });
    });

    it("既存の日付には追記する", () => {
      const existing: WorkoutRecordHistory = {
        "2026-03-01": [
          {
            id: "existing",
            date: "2026-03-01",
            label: "running",
            exerciseName: "朝のジョグ",
            caloriesBurned: 200,
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-01T00:00:00.000Z",
          },
        ],
      };
      mockGetWorkoutRecordHistory.mockReturnValue(existing);

      addWorkoutRecord({
        exerciseId: "exercise-1",
        label: "running",
        date: "2026-03-01",
        exerciseName: "夜のジョグ",
        caloriesBurned: 250,
      });

      const savedHistory = mockSaveWorkoutRecordHistory.mock.calls[0][0];
      expect(savedHistory["2026-03-01"]).toHaveLength(2);
      expect(savedHistory["2026-03-01"][0].id).toBe("existing");
    });

    it("runningのレコードにweightKg等が含まれない", () => {
      const record = addWorkoutRecord({
        exerciseId: "exercise-1",
        label: "running",
        date: "2026-03-01",
        exerciseName: "ランニング",
        caloriesBurned: 300,
      });

      expect(record).not.toHaveProperty("weightKg");
      expect(record).not.toHaveProperty("reps");
    });
  });

  describe("deleteWorkoutRecord", () => {
    it("指定日の対象レコードのみ削除する", () => {
      mockGetWorkoutRecordHistory.mockReturnValue({
        "2026-03-01": [
          {
            id: "keep",
            date: "2026-03-01",
            label: "strength",
            exerciseName: "スクワット",
            weightKg: 80,
            reps: 8,
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-01T00:00:00.000Z",
          },
          {
            id: "remove",
            date: "2026-03-01",
            label: "strength",
            exerciseName: "デッドリフト",
            weightKg: 100,
            reps: 5,
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-01T00:00:00.000Z",
          },
        ],
      });

      deleteWorkoutRecord("2026-03-01", "remove");

      const savedHistory = mockSaveWorkoutRecordHistory.mock.calls[0][0];
      expect(savedHistory["2026-03-01"]).toHaveLength(1);
      expect(savedHistory["2026-03-01"][0].id).toBe("keep");
    });

    it("その日の最後の1件を消すと日付キー自体を削除する", () => {
      mockGetWorkoutRecordHistory.mockReturnValue({
        "2026-03-01": [
          {
            id: "only",
            date: "2026-03-01",
            label: "running",
            exerciseName: "ラン",
            caloriesBurned: 100,
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-01T00:00:00.000Z",
          },
        ],
      });

      deleteWorkoutRecord("2026-03-01", "only");

      const savedHistory = mockSaveWorkoutRecordHistory.mock.calls[0][0];
      expect(savedHistory).not.toHaveProperty("2026-03-01");
    });

    it("存在しない日付を指定しても何もしない", () => {
      mockGetWorkoutRecordHistory.mockReturnValue({});
      mockSaveWorkoutRecordHistory.mockReturnValue(true);

      deleteWorkoutRecord("2026-03-01", "none");

      expect(mockSaveWorkoutRecordHistory).not.toHaveBeenCalled();
    });
  });

  describe("getAllWorkoutRecords", () => {
    it("全レコードを作成日時の新しい順に返す", () => {
      mockGetWorkoutRecordHistory.mockReturnValue({
        "2026-03-01": [
          {
            id: "old",
            date: "2026-03-01",
            label: "strength",
            exerciseName: "A",
            weightKg: 50,
            reps: 10,
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-01T00:00:00.000Z",
          },
        ],
        "2026-03-02": [
          {
            id: "new",
            date: "2026-03-02",
            label: "running",
            exerciseName: "B",
            caloriesBurned: 300,
            createdAt: "2026-03-02T00:00:00.000Z",
            updatedAt: "2026-03-02T00:00:00.000Z",
          },
        ],
      });

      const result = getAllWorkoutRecords();

      expect(result.map((r) => r.id)).toEqual(["new", "old"]);
    });
  });
});
