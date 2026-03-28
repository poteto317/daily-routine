import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";

type MealPageStateResultArgs = {
  descriptionInput: string;
  mealTypeInput: MealType;
  notesInput: string;
  recentMeals: MealRecord[];
  showForm: boolean;
  timeInput: string;
  today: string;
  todayMeals: MealRecord[];
  handleAddMeal: () => void;
  handleCancelForm: () => void;
  handleDeleteMeal: (date: string, mealId: string) => void;
  openForm: () => void;
  setDescriptionInput: Dispatch<SetStateAction<string>>;
  setMealTypeInput: Dispatch<SetStateAction<MealType>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
  setTimeInput: Dispatch<SetStateAction<string>>;
};

export const createMealPageStateResult = ({
  descriptionInput,
  mealTypeInput,
  notesInput,
  recentMeals,
  showForm,
  timeInput,
  today,
  todayMeals,
  handleAddMeal,
  handleCancelForm,
  handleDeleteMeal,
  openForm,
  setDescriptionInput,
  setMealTypeInput,
  setNotesInput,
  setTimeInput,
}: MealPageStateResultArgs) => {
  return {
    descriptionInput,
    mealTypeInput,
    notesInput,
    recentMeals,
    showForm,
    timeInput,
    today,
    todayMeals,
    handleAddMeal,
    handleCancelForm,
    handleDeleteMeal,
    openForm,
    setDescriptionInput,
    setMealTypeInput,
    setNotesInput,
    setTimeInput,
  };
};
