import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

import {
  getMealHistory,
  saveMealHistory,
  getMealRecordsByDate,
  getTodayMealRecords,
  getMealRecordsByPeriod,
} from "../storage";
import { getTodayString } from "@/lib/storage/core";

describe("meal storage data and queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({});
  });

  const createMealHistory = () => ({
    "2026-02-09": [
      {
        id: "1",
        date: "2026-02-09",
        mealType: "breakfast" as const,
        time: "08:00",
        description: "朝食",
        createdAt: "2026-02-09T08:00:00Z",
        updatedAt: "2026-02-09T08:00:00Z",
      },
    ],
  });

  it("get/save meal historyが動作する", () => {
    const history = createMealHistory();
    mockGetStorageItem.mockReturnValue(history);

    expect(getMealHistory()).toEqual(history);
    expect(mockGetStorageItem).toHaveBeenCalledWith("meal-history", {});

    saveMealHistory(history);
    expect(mockSetStorageItem).toHaveBeenCalledWith("meal-history", history);
  });

  it("日付・今日・期間で記録取得できる", () => {
    // 本番と同じ「今日」の求め方を使う。テスト側で別の求め方をすると、
    // 実装のタイムゾーン不整合を検出できない
    const today = getTodayString();
    mockGetStorageItem.mockReturnValue({
      [today]: [
        {
          id: "t1",
          date: today,
          mealType: "breakfast",
          time: "08:00",
          description: "朝",
          createdAt: `${today}T08:00:00Z`,
          updatedAt: `${today}T08:00:00Z`,
        },
      ],
      "2026-02-09": [
        {
          id: "a",
          date: "2026-02-09",
          mealType: "lunch",
          time: "12:00",
          description: "昼",
          createdAt: "2026-02-09T12:00:00Z",
          updatedAt: "2026-02-09T12:00:00Z",
        },
      ],
      "2026-02-10": [
        {
          id: "b",
          date: "2026-02-10",
          mealType: "dinner",
          time: "19:00",
          description: "夜",
          createdAt: "2026-02-10T19:00:00Z",
          updatedAt: "2026-02-10T19:00:00Z",
        },
      ],
    });

    expect(getMealRecordsByDate("2026-02-09")).toHaveLength(1);
    expect(getTodayMealRecords()).toHaveLength(1);
    const records = getMealRecordsByPeriod("2026-02-09", "2026-02-10");
    expect(records.map((value) => value.date)).toEqual([
      "2026-02-10",
      "2026-02-09",
    ]);
  });
});
