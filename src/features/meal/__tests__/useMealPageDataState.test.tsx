import { renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getMealHistory: jest.fn(() => ({})),
  getTodayMealRecords: jest.fn(() => []),
}));

jest.mock("../utils/mealFormat", () => ({
  getCurrentTimeString: jest.fn(() => "08:30"),
  getTodayDateString: jest.fn(() => "2024-01-12"),
  sortMealsByDateTimeDesc: jest.fn((records) => records),
}));

import { getMealHistory, getTodayMealRecords } from "../storage";
import { useMealPageDataState } from "../useMealPageDataState";

describe("useMealPageDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
