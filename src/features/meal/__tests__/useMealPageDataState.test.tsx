import { renderHook } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

jest.mock("../storage", () => ({
  getMealHistory: jest.fn(() => ({})),
  getTodayMealRecords: jest.fn(() => []),
}));

jest.mock("../utils/mealFormat", () => ({
  getCurrentTimeString: jest.fn(() => "08:30"),
  sortMealsByDateTimeDesc: jest.fn((records) => records),
}));

import { useJstTodayKey } from "@/hooks/useToday";
import { getMealHistory, getTodayMealRecords } from "../storage";
import { useMealPageDataState } from "../useMealPageDataState";

describe("useMealPageDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-12");
    (getMealHistory as jest.Mock).mockReturnValue({});
    (getTodayMealRecords as jest.Mock).mockReturnValue([]);
  });

  it("初期の today と meal 一覧を構築する", () => {
    const meal = {
      id: "meal-1",
      date: "2024-01-12",
      mealType: "breakfast" as const,
      time: "08:00",
      description: "toast",
      createdAt: "2024-01-12T08:00:00.000Z",
      updatedAt: "2024-01-12T08:00:00.000Z",
    };

    (getTodayMealRecords as jest.Mock).mockReturnValue([meal]);
    (getMealHistory as jest.Mock).mockReturnValue({ [meal.date]: [meal] });

    const { result } = renderHook(() => useMealPageDataState());

    expect(result.current.today).toBe("2024-01-12");
    expect(result.current.todayMeals).toEqual([meal]);
    expect(result.current.recentMeals).toEqual([meal]);
    expect(result.current.initialState.timeInput).toBe("08:30");
  });

  it("日をまたいだ後の再描画で、表示用の today が共通フックの新しい日付になる", () => {
    const meal = {
      id: "meal-1",
      date: "2024-01-12",
      mealType: "dinner" as const,
      time: "23:30",
      description: "soba",
      createdAt: "2024-01-12T14:30:00.000Z",
      updatedAt: "2024-01-12T14:30:00.000Z",
    };
    (getTodayMealRecords as jest.Mock).mockReturnValue([meal]);

    const { result, rerender } = renderHook(() => useMealPageDataState());
    expect(result.current.today).toBe("2024-01-12");

    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-13");
    rerender();

    expect(result.current.today).toBe("2024-01-13");
    // 今日の食事は、保存か再読み込みまで前日のまま（設計書「既知の制約と懸念」2）
    expect(result.current.todayMeals).toEqual([meal]);
  });
});
