import { useMealPageActions } from "./useMealPageActions";
import { createMealPageActionBindings } from "./mealPageActionBindings";
import { createMealPageStateResult } from "./mealPageStateResult";
import { useMealPageFormState } from "./useMealPageFormState";
import { useMealPageDataState } from "./useMealPageDataState";

export const useMealPageState = () => {
  const mealData = useMealPageDataState();
  const {
    descriptionInput,
    handleCancelForm,
    mealTypeInput,
    notesInput,
    openForm,
    setDescriptionInput,
    setMealTypeInput,
    setNotesInput,
    setShowForm,
    setTimeInput,
    showForm,
    timeInput,
  } = useMealPageFormState(mealData.initialState);
  const { handleAddMeal, handleDeleteMeal } = useMealPageActions(
    createMealPageActionBindings({
      today: mealData.today,
      mealTypeInput,
      timeInput,
      descriptionInput,
      notesInput,
      setTodayMeals: mealData.setTodayMeals,
      setRecentMeals: mealData.setRecentMeals,
      setShowForm,
      setDescriptionInput,
      setNotesInput,
    }),
  );

  return createMealPageStateResult({
    descriptionInput,
    mealTypeInput,
    notesInput,
    recentMeals: mealData.recentMeals,
    showForm,
    timeInput,
    today: mealData.today,
    todayMeals: mealData.todayMeals,
    handleAddMeal,
    handleCancelForm,
    handleDeleteMeal,
    openForm,
    setDescriptionInput,
    setMealTypeInput,
    setNotesInput,
    setTimeInput,
  });
};
