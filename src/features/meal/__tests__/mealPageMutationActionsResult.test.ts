import { createMealPageMutationActionsResult } from "../mealPageMutationActionsResult";

describe("createMealPageMutationActionsResult", () => {
  it("add/delete action を公開 shape に載せる", () => {
    const handleAddMeal = jest.fn();
    const handleDeleteMeal = jest.fn();

    expect(
      createMealPageMutationActionsResult({
        handleAddMeal,
        handleDeleteMeal,
      }),
    ).toEqual({
      handleAddMeal,
      handleDeleteMeal,
    });
  });
});
