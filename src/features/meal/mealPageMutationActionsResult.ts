type MealPageMutationActionsResultArgs = {
  handleAddMeal: () => void;
  handleDeleteMeal: (date: string, mealId: string) => void;
};

export const createMealPageMutationActionsResult = ({
  handleAddMeal,
  handleDeleteMeal,
}: MealPageMutationActionsResultArgs) => {
  return {
    handleAddMeal,
    handleDeleteMeal,
  };
};
