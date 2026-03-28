import { createMealPageReloadActionResult } from "../mealPageReloadActionResult";

describe("createMealPageReloadActionResult", () => {
  it("reloadMeals を公開 shape に載せる", () => {
    const reloadMeals = jest.fn();

    expect(createMealPageReloadActionResult({ reloadMeals })).toEqual({
      reloadMeals,
    });
  });
});
