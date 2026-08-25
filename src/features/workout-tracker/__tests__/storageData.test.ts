import {
  getWorkoutRecordHistory,
  saveWorkoutRecordHistory,
} from "../storageData";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("workout-tracker storageData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({} as never);
  });

  it("getWorkoutRecordHistoryは履歴を取得する", () => {
    const history = {
      "2026-03-01": [
        {
          id: "w1",
          date: "2026-03-01",
          label: "strength" as const,
          exerciseName: "ベンチプレス",
          weightKg: 60,
          reps: 10,
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z",
        },
      ],
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getWorkoutRecordHistory();

    expect(result).toEqual(history);
    expect(mockGetStorageItem).toHaveBeenCalledWith("workout-records", {});
  });

  it("saveWorkoutRecordHistoryは履歴を保存する", () => {
    const history = { "2026-03-01": [] };

    saveWorkoutRecordHistory(history);

    expect(mockSetStorageItem).toHaveBeenCalledWith("workout-records", history);
  });
});
