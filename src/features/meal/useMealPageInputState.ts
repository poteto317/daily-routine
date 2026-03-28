import { useState } from "react";
import type { MealType } from "@/types/routine";

type UseMealPageInputStateParams = {
  initialMealTypeInput: MealType;
  initialTimeInput: string;
  initialDescriptionInput: string;
  initialNotesInput: string;
};

export const useMealPageInputState = ({
  initialMealTypeInput,
  initialTimeInput,
  initialDescriptionInput,
  initialNotesInput,
}: UseMealPageInputStateParams) => {
  const [mealTypeInput, setMealTypeInput] =
    useState<MealType>(initialMealTypeInput);
  const [timeInput, setTimeInput] = useState(initialTimeInput);
  const [descriptionInput, setDescriptionInput] = useState(
    initialDescriptionInput,
  );
  const [notesInput, setNotesInput] = useState(initialNotesInput);

  return {
    descriptionInput,
    mealTypeInput,
    notesInput,
    timeInput,
    setDescriptionInput,
    setMealTypeInput,
    setNotesInput,
    setTimeInput,
  };
};
