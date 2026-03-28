type MealPageActionsResultArgs = {
  handleAddMeal: () => void;
  handleDeleteMeal: (date: string, mealId: string) => void;
  reloadMeals: () => void;
};

export const createMealPageActionsResult = ({
  handleAddMeal,
  handleDeleteMeal,
  reloadMeals,
}: MealPageActionsResultArgs) => {
  return {
    handleAddMeal,
    handleDeleteMeal,
    reloadMeals,
  };
};
