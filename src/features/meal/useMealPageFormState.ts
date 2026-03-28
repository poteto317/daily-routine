import type { MealViewState } from "./mealViewStateActions";
import { createMealPageFormStateResult } from "./mealPageFormStateResult";
import { useMealPageFormActions } from "./useMealPageFormActions";
import { useMealPageFormVisibilityState } from "./useMealPageFormVisibilityState";
import { useMealPageInputState } from "./useMealPageInputState";

type MealFormInitialState = Pick<
  MealViewState,
  "showForm" | "mealTypeInput" | "timeInput" | "descriptionInput" | "notesInput"
>;

export const useMealPageFormState = (initialState: MealFormInitialState) => {
  const visibilityState = useMealPageFormVisibilityState({
    initialShowForm: initialState.showForm,
  });
  const inputState = useMealPageInputState({
    initialMealTypeInput: initialState.mealTypeInput,
    initialTimeInput: initialState.timeInput,
    initialDescriptionInput: initialState.descriptionInput,
    initialNotesInput: initialState.notesInput,
  });
  const { handleCancelForm, openForm, resetForm } = useMealPageFormActions({
    setShowForm: visibilityState.setShowForm,
    setDescriptionInput: inputState.setDescriptionInput,
    setNotesInput: inputState.setNotesInput,
  });

  return createMealPageFormStateResult({
    inputState,
    visibilityState,
    handleCancelForm,
    openForm,
    resetForm,
  });
};
