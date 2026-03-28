import type { useMealPageFormVisibilityState } from "./useMealPageFormVisibilityState";
import type { useMealPageInputState } from "./useMealPageInputState";

type MealPageInputState = ReturnType<typeof useMealPageInputState>;
type MealPageFormVisibilityState = ReturnType<
  typeof useMealPageFormVisibilityState
>;

type CreateMealPageFormStateResultArgs = {
  inputState: MealPageInputState;
  visibilityState: MealPageFormVisibilityState;
  handleCancelForm: () => void;
  openForm: () => void;
  resetForm: () => void;
};

export const createMealPageFormStateResult = ({
  inputState,
  visibilityState,
  handleCancelForm,
  openForm,
  resetForm,
}: CreateMealPageFormStateResultArgs) => {
  return {
    ...inputState,
    ...visibilityState,
    handleCancelForm,
    openForm,
    resetForm,
  };
};
