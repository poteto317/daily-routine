import { act, renderHook } from "@testing-library/react";
import type { WorkoutRecord } from "@/types/routine";
import { useWorkoutTrackerDataState } from "../page/useWorkoutTrackerDataState";
import { getAllWorkoutRecords } from "../storage";

jest.mock("../storage", () => ({
  getAllWorkoutRecords: jest.fn(),
}));

const mockGetAllWorkoutRecords = getAllWorkoutRecords as jest.MockedFunction<
  typeof getAllWorkoutRecords
>;

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

describe("useWorkoutTrackerDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期表示時にgetAllWorkoutRecordsの結果をstateに反映する", () => {
    mockGetAllWorkoutRecords.mockReturnValue([record]);

    const { result } = renderHook(() => useWorkoutTrackerDataState());

    expect(result.current.records).toEqual([record]);
  });

  it("reloadで最新の記録を再取得する", () => {
    mockGetAllWorkoutRecords.mockReturnValue([]);
    const { result } = renderHook(() => useWorkoutTrackerDataState());
    expect(result.current.records).toEqual([]);

    mockGetAllWorkoutRecords.mockReturnValue([record]);
    act(() => result.current.reload());

    expect(result.current.records).toEqual([record]);
  });
});
