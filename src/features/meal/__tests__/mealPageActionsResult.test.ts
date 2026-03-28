import { createMealPageActionsResult } from "../mealPageActionsResult";

describe("mealPageActionsResult", () => {
  it("meal actions hook の公開 shape を組み立てる", () => {
    const handleAddMeal = jest.fn();
    const handleDeleteMeal = jest.fn();
    const reloadMeals = jest.fn();

    expect(
      createMealPageActionsResult({
        handleAddMeal,
        handleDeleteMeal,
        reloadMeals,
      }),
    ).toEqual({
      handleAddMeal,
      handleDeleteMeal,
      reloadMeals,
    });
  });
});
