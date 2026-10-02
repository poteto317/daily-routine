import * as actions from "../mealPageStateActions";

describe("mealPageStateActions exports", () => {
  it("all actions are properly exported", () => {
    expect(actions.createCancelMealFormAction).toBeDefined();
    expect(actions.createOpenMealFormAction).toBeDefined();
    expect(actions.createResetMealFormAction).toBeDefined();
    expect(actions.createReloadMealsAction).toBeDefined();
    expect(actions.createMealAddHandler).toBeDefined();
    expect(actions.createMealDeleteHandler).toBeDefined();
  });
});
