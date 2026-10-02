import * as mealModule from "../index";

describe("meal index exports", () => {
  it("MealPage and storage functions are exported", () => {
    expect(mealModule.MealPage).toBeDefined();
    expect(mealModule.getMealHistory).toBeDefined();
    expect(mealModule.saveMealHistory).toBeDefined();
    expect(mealModule.getMealRecordsByDate).toBeDefined();
    expect(mealModule.getTodayMealRecords).toBeDefined();
    expect(mealModule.getMealRecordsByPeriod).toBeDefined();
    expect(mealModule.addMealRecord).toBeDefined();
    expect(mealModule.updateMealRecord).toBeDefined();
    expect(mealModule.deleteMealRecord).toBeDefined();
  });
});
