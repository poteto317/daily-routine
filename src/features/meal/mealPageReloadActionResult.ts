type MealPageReloadActionResultArgs = {
  reloadMeals: () => void;
};

export const createMealPageReloadActionResult = ({
  reloadMeals,
}: MealPageReloadActionResultArgs) => {
  return { reloadMeals };
};
