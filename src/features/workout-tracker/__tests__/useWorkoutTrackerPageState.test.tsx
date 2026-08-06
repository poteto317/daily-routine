import { act, renderHook } from "@testing-library/react";
import { useWorkoutTrackerPageState } from "../page/useWorkoutTrackerPageState";
import * as storage from "../storage";

jest.mock("../storage", () => ({
  getAllWorkoutRecords: jest.fn(() => []),
  addWorkoutRecord: jest.fn(),
  deleteWorkoutRecord: jest.fn(),
}));

const mockGetAllWorkoutRecords = storage.getAllWorkoutRecords as jest.MockedFunction<
  typeof storage.getAllWorkoutRecords
>;
const mockAddWorkoutRecord = storage.addWorkoutRecord as jest.MockedFunction<
  typeof storage.addWorkoutRecord
>;
const mockDeleteWorkoutRecord = storage.deleteWorkoutRecord as jest.MockedFunction<
  typeof storage.deleteWorkoutRecord
>;

describe("useWorkoutTrackerPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllWorkoutRecords.mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("初期状態は空のgroupsとエラーなし", () => {
    const { result } = renderHook(() => useWorkoutTrackerPageState());

    expect(result.current.groups).toEqual([]);
    expect(result.current.formError).toBeNull();
  });

  it("必須項目が未入力のままsubmitするとエラーが設定され永続化されない", () => {
    const { result } = renderHook(() => useWorkoutTrackerPageState());

    act(() => result.current.onSubmitAction());

    expect(mockAddWorkoutRecord).not.toHaveBeenCalled();
    expect(result.current.formError).not.toBeNull();
  });

  it("strengthの入力を揃えてsubmitすると記録が追加され一覧に反映される", () => {
    const added = {
      id: "1",
      date: "2026-03-01",
      label: "strength" as const,
      exerciseName: "ベンチプレス",
      weightKg: 60,
      reps: 10,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };
    mockAddWorkoutRecord.mockReturnValue(added);

    const { result } = renderHook(() => useWorkoutTrackerPageState());

    act(() => {
      result.current.setExerciseName("ベンチプレス");
      result.current.setWeightKg("60");
      result.current.setReps("10");
    });

    mockGetAllWorkoutRecords.mockReturnValue([added]);
    act(() => result.current.onSubmitAction());

    expect(mockAddWorkoutRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "strength",
        exerciseName: "ベンチプレス",
        weightKg: 60,
        reps: 10,
      }),
    );
    expect(result.current.groups).toEqual([
      { date: "2026-03-01", records: [added] },
    ]);
    expect(result.current.formValues.exerciseName).toBe("");
  });

  it("エラー表示後に入力を直して送信すると成功しエラーが消える", () => {
    const added = {
      id: "1",
      date: "2026-03-01",
      label: "strength" as const,
      exerciseName: "ベンチプレス",
      weightKg: 60,
      reps: 10,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };
    mockAddWorkoutRecord.mockReturnValue(added);

    const { result } = renderHook(() => useWorkoutTrackerPageState());

    act(() => result.current.onSubmitAction());
    expect(result.current.formError).not.toBeNull();

    act(() => {
      result.current.setExerciseName("ベンチプレス");
      result.current.setWeightKg("60");
      result.current.setReps("10");
    });
    mockGetAllWorkoutRecords.mockReturnValue([added]);
    act(() => result.current.onSubmitAction());

    expect(result.current.formError).toBeNull();
  });

  it("onDeleteRecordActionは確認後に削除しreloadする", () => {
    const record = {
      id: "1",
      date: "2026-03-01",
      label: "running" as const,
      exerciseName: "ジョグ",
      caloriesBurned: 300,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };
    mockGetAllWorkoutRecords.mockReturnValue([record]);
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const { result } = renderHook(() => useWorkoutTrackerPageState());
    expect(result.current.groups).toHaveLength(1);

    mockGetAllWorkoutRecords.mockReturnValue([]);
    act(() => result.current.onDeleteRecordAction(record));

    expect(mockDeleteWorkoutRecord).toHaveBeenCalledWith("2026-03-01", "1");
    expect(result.current.groups).toEqual([]);
  });
});
