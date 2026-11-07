import { renderHook } from "@testing-library/react";
import type { WeightRecord } from "@/types/routine";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

jest.mock("../storage", () => ({
  getTodayWeightRecord: jest.fn(() => null),
  getWeightHistory: jest.fn(() => ({})),
}));

jest.mock("../page/weightRecordQueries", () => ({
  getRecentWeightRecords: jest.fn((history: Record<string, WeightRecord>) =>
    Object.values(history).sort((a, b) => b.date.localeCompare(a.date)),
  ),
  WEIGHT_TRACKER_MESSAGES: {
    alertInvalidWeight: "invalid",
    confirmDeleteTemplate: (date: string) => `${date} を削除しますか？`,
  },
}));

import { useJstTodayKey } from "@/hooks/useToday";
import { getTodayWeightRecord, getWeightHistory } from "../storage";
import { useWeightTrackerDataState } from "../page/useWeightTrackerDataState";

describe("useWeightTrackerDataState", () => {
  const todayRecord: WeightRecord = {
    id: "weight-1",
    date: "2024-01-12",
    weight: 69.5,
    notes: "today",
    createdAt: "2024-01-12T07:00:00.000Z",
    updatedAt: "2024-01-12T07:00:00.000Z",
  };

  const previousRecord: WeightRecord = {
    ...todayRecord,
    id: "weight-2",
    date: "2024-01-11",
    notes: "previous",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-12");
    (getTodayWeightRecord as jest.Mock).mockReturnValue(todayRecord);
    (getWeightHistory as jest.Mock).mockReturnValue({
      [todayRecord.date]: todayRecord,
      [previousRecord.date]: previousRecord,
    });
  });

  it("初期データを読み込む", () => {
    const { result } = renderHook(() => useWeightTrackerDataState());

    expect(result.current.today).toBe("2024-01-12");
    expect(result.current.initialTodayRecord).toEqual(todayRecord);
    expect(result.current.todayRecord).toEqual(todayRecord);
    expect(result.current.recentRecords).toEqual([todayRecord, previousRecord]);
  });

  it("日をまたいだ後の再描画で、表示用の today が共通フックの新しい日付になる", () => {
    const { result, rerender } = renderHook(() => useWeightTrackerDataState());
    expect(result.current.today).toBe("2024-01-12");

    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-13");
    rerender();

    expect(result.current.today).toBe("2024-01-13");
    // 今日の記録は、保存か再読み込みまで前日のまま（設計書「既知の制約と懸念」2）
    expect(result.current.todayRecord).toEqual(todayRecord);
  });
});
