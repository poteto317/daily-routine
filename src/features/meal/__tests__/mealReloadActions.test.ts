import { createReloadMealsAction } from "../mealReloadActions";

describe("mealReloadActions", () => {
  it("再読込 action で today/recent meals を更新する", () => {
    const meal = {
      id: "meal-1",
      date: "2024-01-12",
      mealType: "lunch" as const,
      time: "12:00",
      description: "ramen",
      createdAt: "2024-01-12T12:00:00.000Z",
      updatedAt: "2024-01-12T12:00:00.000Z",
    };
    const setTodayMeals = jest.fn();
    const setRecentMeals = jest.fn();

    createReloadMealsAction({
      getTodayMealRecords: () => [meal],
      getMealHistory: () => ({ [meal.date]: [meal] }),
      setTodayMeals,
      setRecentMeals,
    })();

    expect(setTodayMeals).toHaveBeenCalledWith([meal]);
    expect(setRecentMeals).toHaveBeenCalledWith([meal]);
  });
});